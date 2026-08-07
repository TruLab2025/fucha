import { execFile } from 'node:child_process';
import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const root = process.cwd();
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const commitArgumentIndex = args.indexOf('--commit');
const requestedCommit = commitArgumentIndex >= 0 ? args[commitArgumentIndex + 1] : null;
const profilePath = process.env.FUCHA_DEPLOY_PROFILE
  || path.join(os.homedir(), '.config', 'fucha24', 'production.env');

if (commitArgumentIndex >= 0 && !requestedCommit) {
  throw new Error('--commit requires a commit SHA or ref.');
}

const report = {
  COMMIT: 'PENDING',
  BUILD: 'PENDING',
  MIGRATIONS: 'PENDING',
  RELEASE: 'PENDING',
  UPLOAD: 'PENDING',
  'ACTIVATE RELEASE': 'PENDING',
  'PASSENGER RESTART': 'PENDING',
  'SMOKE TEST': 'PENDING',
  PRODUCTION: 'PENDING',
  RESULT: 'PENDING',
};

function printReport() {
  console.log('\nDEPLOY REPORT');
  for (const [label, value] of Object.entries(report)) {
    console.log(`${label}: ${value}`);
  }
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\\"'\\\"'")}'`;
}

async function run(command, commandArgs, options = {}) {
  const { cwd = root, env = process.env, capture = false } = options;
  const result = await execFileAsync(command, commandArgs, {
    cwd,
    env,
    maxBuffer: 10 * 1024 * 1024,
  });
  if (!capture && result.stdout) process.stdout.write(result.stdout);
  if (!capture && result.stderr) process.stderr.write(result.stderr);
  return result.stdout.trim();
}

async function loadProfile() {
  try {
    const text = await readFile(profilePath, 'utf8');
    return Object.fromEntries(
      text.split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'))
        .map((line) => {
          const separator = line.indexOf('=');
          if (separator < 1) throw new Error(`Invalid deployment profile line: ${line}`);
          const key = line.slice(0, separator).trim();
          let value = line.slice(separator + 1).trim();
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          return [key, value];
        }),
    );
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}

function assertProductionProfile(profile) {
  const required = [
    'FUCHA_PROD_SSH_HOST',
    'FUCHA_PROD_SSH_USER',
    'FUCHA_PROD_SSH_KEY',
    'FUCHA_PROD_APP_ROOT',
    'FUCHA_PROD_RELEASES_DIR',
    'FUCHA_PROD_URL',
    'FUCHA_PROD_BASIC_AUTH_USER',
    'FUCHA_PROD_BASIC_AUTH_PASSWORD',
  ];
  const missing = required.filter((key) => !profile[key] || profile[key].includes('REPLACE_'));
  if (missing.length) {
    throw new Error(`Incomplete production profile ${profilePath}: ${missing.join(', ')}`);
  }

  const prohibitedHosts = new Set(['localhost', '127.0.0.1', '::1', 'mini', '192.168.1.62']);
  if (prohibitedHosts.has(profile.FUCHA_PROD_SSH_HOST)) {
    throw new Error('Refusing a deployment target that could be this Mac mini or its control plane.');
  }
  if (!/^https:\/\//.test(profile.FUCHA_PROD_URL)) {
    throw new Error('FUCHA_PROD_URL must use https.');
  }
  for (const key of ['FUCHA_PROD_APP_ROOT', 'FUCHA_PROD_RELEASES_DIR']) {
    if (!profile[key].startsWith('/')) {
      throw new Error(`${key} must be an absolute production path.`);
    }
  }
}

function sshArguments(profile, remoteCommand) {
  return [
    '-i', profile.FUCHA_PROD_SSH_KEY,
    '-p', profile.FUCHA_PROD_SSH_PORT || '22',
    '-o', 'BatchMode=yes',
    '-o', 'StrictHostKeyChecking=yes',
    `${profile.FUCHA_PROD_SSH_USER}@${profile.FUCHA_PROD_SSH_HOST}`,
    remoteCommand,
  ];
}

async function remote(profile, command, capture = false) {
  return run('ssh', sshArguments(profile, command), { capture });
}

async function resolveCommit() {
  const ref = requestedCommit || 'HEAD';
  const commit = await run('git', ['rev-parse', '--verify', `${ref}^{commit}`], { capture: true });
  const isOnMain = await execFileAsync('git', ['merge-base', '--is-ancestor', commit, 'origin/main'], { cwd: root })
    .then(() => true)
    .catch(() => false);
  if (!isOnMain && !dryRun) {
    throw new Error(`${commit} is not contained in origin/main; refusing a production release outside the approved branch.`);
  }
  return commit;
}

async function assertNoMigrations(commit) {
  const migrationFiles = await run('git', ['ls-tree', '-r', '--name-only', commit, '--', 'prisma/migrations'], { capture: true });
  if (migrationFiles) {
    throw new Error('This pipeline is intentionally migration-free until the Prisma baseline is separately approved.');
  }
  report.MIGRATIONS = 'NONE';
}

async function buildRelease(commit) {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'fucha24-release-'));
  const worktree = path.join(temporaryRoot, 'worktree');

  try {
    await run('git', ['worktree', 'add', '--detach', worktree, commit]);
    await run('npm', ['ci'], { cwd: worktree });
    await run('npm', ['run', 'check'], { cwd: worktree });
    await run('npm', ['run', 'build'], {
      cwd: worktree,
      env: {
        ...process.env,
        FUCHA_RELEASE_BUILD: '1',
        FUCHA_RELEASE_COMMIT: commit,
      },
    });

    const releaseDirectory = path.join(worktree, 'release');
    const metadata = JSON.parse(await readFile(path.join(releaseDirectory, '.release.json'), 'utf8'));
    if (metadata.commit !== commit) {
      throw new Error(`Release metadata commit mismatch: expected ${commit}, got ${metadata.commit}.`);
    }
    await access(path.join(releaseDirectory, 'public', '_fucha-release.json'));
    report.BUILD = 'PASS';
    report.RELEASE = `PASS (${commit.slice(0, 7)})`;
    return { temporaryRoot, worktree, releaseDirectory };
  } catch (error) {
    await removeWorktree(worktree, temporaryRoot);
    throw error;
  }
}

async function removeWorktree(worktree, temporaryRoot) {
  try {
    await run('git', ['worktree', 'remove', '--force', worktree]);
  } catch {
    // The temporary directory is still removed below; the Git worktree was never a user checkout.
  }
  await rm(temporaryRoot, { recursive: true, force: true });
}

async function deployRelease(profile, commit, releaseDirectory) {
  const appRoot = profile.FUCHA_PROD_APP_ROOT;
  const releasesRoot = profile.FUCHA_PROD_RELEASES_DIR;
  const finalRelease = `${releasesRoot}/${commit}`;
  const incomingRelease = `${releasesRoot}/.${commit}.incoming-${process.pid}`;
  const currentLink = `${releasesRoot}/current`;
  const nextLink = `${releasesRoot}/.current-next-${process.pid}`;

  const preflight = [
    'set -eu',
    `test -d ${shellQuote(appRoot)}`,
    `test -f ${shellQuote(`${appRoot}/server.js`)}`,
    `mkdir -p ${shellQuote(`${appRoot}/tmp`)} ${shellQuote(releasesRoot)}`,
    `if test -e ${shellQuote(`${appRoot}/release`)} && test ! -L ${shellQuote(`${appRoot}/release`)}; then echo 'APP_ROOT/release must be a symlink' >&2; exit 1; fi`,
    `if test ! -L ${shellQuote(`${appRoot}/release`)}; then ln -s ${shellQuote(currentLink)} ${shellQuote(`${appRoot}/release`)}; fi`,
    `if test -e ${shellQuote(finalRelease)}; then cat ${shellQuote(`${finalRelease}/.release.json`)}; fi`,
  ].join('\n');
  const existingRelease = await remote(profile, preflight, true);

  if (existingRelease) {
    const metadata = JSON.parse(existingRelease);
    if (metadata.commit !== commit) {
      throw new Error(`Production already has a conflicting release directory for ${commit}.`);
    }
    report.UPLOAD = `SKIPPED (release ${commit.slice(0, 7)} already present)`;
  } else {
    await remote(profile, `set -eu\ntest ! -e ${shellQuote(incomingRelease)}\nmkdir -p ${shellQuote(incomingRelease)}`);
    const transport = `ssh -i ${profile.FUCHA_PROD_SSH_KEY} -p ${profile.FUCHA_PROD_SSH_PORT || '22'} -o BatchMode=yes -o StrictHostKeyChecking=yes`;
    await run('rsync', ['-az', '--delete', '-e', transport, `${releaseDirectory}/`, `${profile.FUCHA_PROD_SSH_USER}@${profile.FUCHA_PROD_SSH_HOST}:${incomingRelease}/`]);
    await remote(profile, [
      'set -eu',
      `test -f ${shellQuote(`${incomingRelease}/.release.json`)}`,
      `grep -F ${shellQuote(`"commit": "${commit}"`)} ${shellQuote(`${incomingRelease}/.release.json`)}`,
      `test ! -e ${shellQuote(finalRelease)}`,
      `mv ${shellQuote(incomingRelease)} ${shellQuote(finalRelease)}`,
    ].join('\n'));
    report.UPLOAD = 'PASS';
  }

  const previousRelease = await remote(profile, `readlink -f ${shellQuote(currentLink)} 2>/dev/null || true`, true);
  await remote(profile, [
    'set -eu',
    `ln -s ${shellQuote(finalRelease)} ${shellQuote(nextLink)}`,
    `mv -Tf ${shellQuote(nextLink)} ${shellQuote(currentLink)}`,
    `touch ${shellQuote(`${appRoot}/tmp/restart.txt`)}`,
  ].join('\n'));
  report['ACTIVATE RELEASE'] = 'PASS';
  report['PASSENGER RESTART'] = 'PASS';

  try {
    const response = await run('curl', [
      '--fail', '--silent', '--show-error', '--max-time', '30',
      '--user', `${profile.FUCHA_PROD_BASIC_AUTH_USER}:${profile.FUCHA_PROD_BASIC_AUTH_PASSWORD}`,
      `${profile.FUCHA_PROD_URL.replace(/\/$/, '')}/_fucha-release.json`,
    ], { capture: true });
    const metadata = JSON.parse(response);
    if (metadata.commit !== commit) {
      throw new Error(`Smoke test received commit ${metadata.commit || 'missing'} instead of ${commit}.`);
    }
    report['SMOKE TEST'] = 'PASS';
    report.PRODUCTION = profile.FUCHA_PROD_URL;
  } catch (error) {
    report['SMOKE TEST'] = `FAIL (${error.message})`;
    if (previousRelease) {
      await remote(profile, [
        'set -eu',
        `ln -s ${shellQuote(previousRelease)} ${shellQuote(nextLink)}`,
        `mv -Tf ${shellQuote(nextLink)} ${shellQuote(currentLink)}`,
        `touch ${shellQuote(`${appRoot}/tmp/restart.txt`)}`,
      ].join('\n'));
      report['ACTIVATE RELEASE'] = 'ROLLED BACK';
      report['PASSENGER RESTART'] = 'ROLLED BACK';
    }
    throw error;
  }
}

let builtRelease;
try {
  const commit = await resolveCommit();
  report.COMMIT = commit;
  await assertNoMigrations(commit);
  builtRelease = await buildRelease(commit);

  if (dryRun) {
    report.UPLOAD = 'SKIPPED (--dry-run; no production connection attempted)';
    report['ACTIVATE RELEASE'] = 'SKIPPED';
    report['PASSENGER RESTART'] = 'SKIPPED';
    report['SMOKE TEST'] = 'SKIPPED';
    report.PRODUCTION = 'NOT CONTACTED';
    report.RESULT = 'PASS (LOCAL PREFLIGHT)';
  } else {
    const profile = await loadProfile();
    assertProductionProfile(profile);
    await deployRelease(profile, commit, builtRelease.releaseDirectory);
    report.RESULT = 'PASS';
  }
} catch (error) {
  report.RESULT = `FAIL (${error.message})`;
  process.exitCode = 1;
} finally {
  if (builtRelease) {
    await removeWorktree(builtRelease.worktree, builtRelease.temporaryRoot);
  }
  printReport();
}
