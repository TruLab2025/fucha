import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const root = process.cwd();
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const commitArgumentIndex = args.indexOf('--commit');
const platformArgumentIndex = args.indexOf('--platform');
const expectTextArgumentIndex = args.indexOf('--expect-text');
const rejectTextArgumentIndex = args.indexOf('--reject-text');
const requestedCommit = commitArgumentIndex >= 0 ? args[commitArgumentIndex + 1] : null;
const requestedPlatform = platformArgumentIndex >= 0 ? args[platformArgumentIndex + 1] : null;
const expectedHomepageText = expectTextArgumentIndex >= 0 ? args[expectTextArgumentIndex + 1] : null;
const rejectedHomepageText = rejectTextArgumentIndex >= 0 ? args[rejectTextArgumentIndex + 1] : null;
const profilePath = process.env.FUCHA_DEPLOY_PROFILE
  || path.join(os.homedir(), '.config', 'fucha24', 'production.env');

if (commitArgumentIndex >= 0 && !requestedCommit) throw new Error('--commit requires a commit SHA or ref.');
if (platformArgumentIndex >= 0 && !requestedPlatform) throw new Error('--platform requires a Docker platform, for example linux/arm64.');
if (expectTextArgumentIndex >= 0 && !expectedHomepageText) throw new Error('--expect-text requires homepage text.');
if (rejectTextArgumentIndex >= 0 && !rejectedHomepageText) throw new Error('--reject-text requires homepage text.');
if (!dryRun && requestedPlatform) throw new Error('The production platform is detected from the cPanel host; --platform is only allowed with --dry-run.');
if (!dryRun && !expectedHomepageText) throw new Error('Production deployment requires --expect-text for the homepage smoke test.');

const report = {
  COMMIT: 'PENDING',
  'BUILD PLATFORM': 'PENDING',
  'DOCKER BUILD': 'PENDING',
  MIGRATIONS: 'PENDING',
  'RELEASE ARTIFACT': 'PENDING',
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
  for (const [label, value] of Object.entries(report)) console.log(`${label}: ${value}`);
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\"'\"'")}'`;
}

async function run(command, commandArgs, options = {}) {
  const { cwd = root, env = process.env, capture = false } = options;
  const result = await execFileAsync(command, commandArgs, { cwd, env, maxBuffer: 10 * 1024 * 1024 });
  if (!capture && result.stdout) process.stdout.write(result.stdout);
  if (!capture && result.stderr) process.stderr.write(result.stderr);
  return result.stdout.trim();
}

async function loadProfile() {
  try {
    const text = await readFile(profilePath, 'utf8');
    return Object.fromEntries(text.split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const separator = line.indexOf('=');
        if (separator < 1) throw new Error(`Invalid deployment profile line: ${line}`);
        const key = line.slice(0, separator).trim();
        let value = line.slice(separator + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
        return [key, value];
      }));
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}

function assertProductionProfile(profile) {
  const required = [
    'FUCHA_PROD_SSH_HOST', 'FUCHA_PROD_SSH_USER', 'FUCHA_PROD_SSH_KEY',
    'FUCHA_PROD_APP_ROOT', 'FUCHA_PROD_RELEASES_DIR', 'FUCHA_PROD_URL',
    'FUCHA_PROD_BASIC_AUTH_USER', 'FUCHA_PROD_BASIC_AUTH_PASSWORD',
  ];
  const missing = required.filter((key) => !profile[key] || profile[key].includes('REPLACE_'));
  if (missing.length) throw new Error(`Incomplete production profile ${profilePath}: ${missing.join(', ')}`);

  const prohibitedHosts = new Set(['localhost', '127.0.0.1', '::1', 'mini', '192.168.1.62']);
  if (prohibitedHosts.has(profile.FUCHA_PROD_SSH_HOST)) {
    throw new Error('Refusing a deployment target that could be this Mac mini or its control plane.');
  }
  if (!/^https:\/\//.test(profile.FUCHA_PROD_URL)) throw new Error('FUCHA_PROD_URL must use https.');
  for (const key of ['FUCHA_PROD_APP_ROOT', 'FUCHA_PROD_RELEASES_DIR']) {
    if (!profile[key].startsWith('/')) throw new Error(`${key} must be an absolute production path.`);
  }
}

function sshArguments(profile, remoteCommand) {
  return [
    '-i', profile.FUCHA_PROD_SSH_KEY,
    '-p', profile.FUCHA_PROD_SSH_PORT || '22',
    '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes',
    `${profile.FUCHA_PROD_SSH_USER}@${profile.FUCHA_PROD_SSH_HOST}`,
    remoteCommand,
  ];
}

async function remote(profile, command, capture = false) {
  return run('ssh', sshArguments(profile, command), { capture });
}

async function uploadRelease(profile, releaseDirectory, incomingRelease) {
  const sshCommand = ['ssh', ...sshArguments(profile, `tar -xzf - -C ${shellQuote(incomingRelease)}`)]
    .map(shellQuote)
    .join(' ');
  const command = `tar --no-xattrs -C ${shellQuote(releaseDirectory)} -czf - . | ${sshCommand}`;
  await run('/bin/sh', ['-c', command]);
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function smokeHomepage(profile) {
  const authorization = `Basic ${Buffer.from(`${profile.FUCHA_PROD_BASIC_AUTH_USER}:${profile.FUCHA_PROD_BASIC_AUTH_PASSWORD}`).toString('base64')}`;
  let lastError;

  for (let attempt = 1; attempt <= 12; attempt += 1) {
    try {
      const target = new URL(`${profile.FUCHA_PROD_URL.replace(/\/$/, '')}/?_fucha_deploy=${Date.now()}-${attempt}`);
      const response = await new Promise((resolve, reject) => {
        const request = https.request(target, {
          method: 'GET', headers: { Authorization: authorization, 'Cache-Control': 'no-cache' }, timeout: 30_000,
        }, (result) => {
          let body = '';
          result.setEncoding('utf8');
          result.on('data', (chunk) => { body += chunk; });
          result.on('end', () => resolve({ statusCode: result.statusCode, body }));
        });
        request.on('timeout', () => request.destroy(new Error('smoke test timed out')));
        request.on('error', reject);
        request.end();
      });
      if (response.statusCode !== 200) throw new Error(`smoke test returned HTTP ${response.statusCode}`);
      if (!response.body.includes(expectedHomepageText)) throw new Error('Homepage does not contain expected deployment text.');
      if (rejectedHomepageText && response.body.includes(rejectedHomepageText)) throw new Error('Homepage still contains rejected deployment text.');
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 12) await wait(5_000);
    }
  }

  throw lastError;
}

async function coldStartProductionApplication(profile) {
  const selector = `cloudlinux-selector --json --interpreter nodejs --user ${shellQuote(profile.FUCHA_PROD_SSH_USER)} --app-root ${shellQuote(profile.FUCHA_PROD_APP_ROOT)}`;
  await remote(profile, [
    'set -eu',
    `${selector.replace('cloudlinux-selector ', 'cloudlinux-selector stop ')} >/dev/null`,
    `${selector.replace('cloudlinux-selector ', 'cloudlinux-selector start ')} >/dev/null`,
  ].join('\n'));
}

async function resolveCommit() {
  const commit = await run('git', ['rev-parse', '--verify', `${requestedCommit || 'HEAD'}^{commit}`], { capture: true });
  const isOnMain = await execFileAsync('git', ['merge-base', '--is-ancestor', commit, 'origin/main'], { cwd: root })
    .then(() => true)
    .catch(() => false);
  if (!isOnMain && !dryRun) throw new Error(`${commit} is not contained in origin/main; refusing a production release outside the approved branch.`);
  return commit;
}

async function assertNoMigrations(commit) {
  const migrationFiles = await run('git', ['ls-tree', '-r', '--name-only', commit, '--', 'prisma/migrations'], { capture: true });
  if (migrationFiles) throw new Error('This pipeline is intentionally migration-free until the Prisma baseline is separately approved.');
  report.MIGRATIONS = 'NONE';
}

function localDockerPlatform() {
  if (process.arch === 'arm64') return 'linux/arm64';
  if (process.arch === 'x64') return 'linux/amd64';
  throw new Error(`Unsupported local CPU architecture for Docker build: ${process.arch}`);
}

async function detectProductionPlatform(profile) {
  const architecture = await remote(profile, 'uname -m', true);
  const platforms = { x86_64: 'linux/amd64', amd64: 'linux/amd64', aarch64: 'linux/arm64', arm64: 'linux/arm64' };
  const platform = platforms[architecture];
  if (!platform) throw new Error(`Unsupported production CPU architecture: ${architecture}`);
  return platform;
}

async function buildRelease(commit, platform) {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'fucha24-docker-release-'));
  const contextDirectory = path.join(temporaryRoot, 'context');
  const archivePath = path.join(temporaryRoot, 'source.tar');
  const releaseDirectory = path.join(temporaryRoot, 'release');

  try {
    await mkdir(contextDirectory);
    await run('git', ['archive', '--format=tar', '--output', archivePath, commit]);
    await run('tar', ['-xf', archivePath, '-C', contextDirectory]);
    await run('docker', [
      'buildx', 'build', '--platform', platform,
      '--build-arg', `FUCHA_RELEASE_COMMIT=${commit}`,
      '--output', `type=local,dest=${releaseDirectory}`,
      '--file', path.join(contextDirectory, 'Dockerfile.release'),
      contextDirectory,
    ]);

    const metadata = JSON.parse(await readFile(path.join(releaseDirectory, '.release.json'), 'utf8'));
    if (metadata.commit !== commit) throw new Error(`Release metadata commit mismatch: expected ${commit}, got ${metadata.commit}.`);
    await readFile(path.join(releaseDirectory, 'public', '_fucha-release.json'));
    report['DOCKER BUILD'] = 'PASS';
    report['RELEASE ARTIFACT'] = `${releaseDirectory} (temporary; removed after upload or dry-run)`;
    report.RELEASE = `PASS (${commit.slice(0, 7)})`;
    return { temporaryRoot, releaseDirectory };
  } catch (error) {
    await rm(temporaryRoot, { recursive: true, force: true });
    throw error;
  }
}

async function deployRelease(profile, commit, releaseDirectory) {
  const appRoot = profile.FUCHA_PROD_APP_ROOT;
  const releasesRoot = profile.FUCHA_PROD_RELEASES_DIR;
  const finalRelease = `${releasesRoot}/${commit}`;
  const incomingRelease = `${releasesRoot}/.${commit}.incoming-${process.pid}`;
  const currentLink = `${releasesRoot}/current`;
  const nextLink = `${releasesRoot}/.current-next-${process.pid}`;
  const appReleaseLink = `${appRoot}/release`;
  const appReleaseNext = `${appRoot}/.release-next-${process.pid}`;

  const preflight = [
    'set -eu', `test -d ${shellQuote(appRoot)}`, `test -f ${shellQuote(`${appRoot}/server.js`)}`,
    `mkdir -p ${shellQuote(`${appRoot}/tmp`)} ${shellQuote(releasesRoot)}`,
    `if test -e ${shellQuote(`${appRoot}/release`)} && test ! -L ${shellQuote(`${appRoot}/release`)}; then echo 'APP_ROOT/release must be a symlink' >&2; exit 1; fi`,
    `if test ! -L ${shellQuote(`${appRoot}/release`)}; then ln -s ${shellQuote(currentLink)} ${shellQuote(`${appRoot}/release`)}; fi`,
    `if test -e ${shellQuote(finalRelease)}; then cat ${shellQuote(`${finalRelease}/.release.json`)}; fi`,
  ].join('\n');
  const existingRelease = await remote(profile, preflight, true);

  if (existingRelease) {
    if (JSON.parse(existingRelease).commit !== commit) throw new Error(`Production already has a conflicting release directory for ${commit}.`);
    report.UPLOAD = `SKIPPED (release ${commit.slice(0, 7)} already present)`;
  } else {
    await remote(profile, `set -eu\ntest ! -e ${shellQuote(incomingRelease)}\nmkdir -p ${shellQuote(incomingRelease)}`);
    await uploadRelease(profile, releaseDirectory, incomingRelease);
    await remote(profile, [
      'set -eu', `test -f ${shellQuote(`${incomingRelease}/.release.json`)}`,
      `grep -F ${shellQuote(`"commit": "${commit}"`)} ${shellQuote(`${incomingRelease}/.release.json`)}`,
      `test ! -e ${shellQuote(finalRelease)}`, `mv ${shellQuote(incomingRelease)} ${shellQuote(finalRelease)}`,
    ].join('\n'));
    report.UPLOAD = 'PASS';
  }

  const previousRelease = await remote(profile, `readlink -f ${shellQuote(appReleaseLink)} 2>/dev/null || true`, true);
  await remote(profile, [
    'set -eu', `ln -s ${shellQuote(finalRelease)} ${shellQuote(nextLink)}`,
    `mv -Tf ${shellQuote(nextLink)} ${shellQuote(currentLink)}`,
    `ln -s ${shellQuote(currentLink)} ${shellQuote(appReleaseNext)}`,
    `mv -Tf ${shellQuote(appReleaseNext)} ${shellQuote(appReleaseLink)}`,
  ].join('\n'));
  await coldStartProductionApplication(profile);
  report['ACTIVATE RELEASE'] = 'PASS';
  report['PASSENGER RESTART'] = 'PASS';

  try {
    await smokeHomepage(profile);
    report['SMOKE TEST'] = 'PASS';
    report.PRODUCTION = profile.FUCHA_PROD_URL;
  } catch (error) {
    report['SMOKE TEST'] = `FAIL (${error.message})`;
    if (previousRelease) {
      await remote(profile, [
        'set -eu', `ln -s ${shellQuote(previousRelease)} ${shellQuote(nextLink)}`,
        `mv -Tf ${shellQuote(nextLink)} ${shellQuote(currentLink)}`,
      ].join('\n'));
      await coldStartProductionApplication(profile);
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
  const profile = dryRun ? null : await loadProfile();
  if (profile) assertProductionProfile(profile);
  const platform = dryRun ? (requestedPlatform || localDockerPlatform()) : await detectProductionPlatform(profile);
  report['BUILD PLATFORM'] = platform;
  builtRelease = await buildRelease(commit, platform);

  if (dryRun) {
    report.UPLOAD = 'SKIPPED (--dry-run; no production connection attempted)';
    report['ACTIVATE RELEASE'] = 'SKIPPED';
    report['PASSENGER RESTART'] = 'SKIPPED';
    report['SMOKE TEST'] = 'SKIPPED';
    report.PRODUCTION = 'NOT CONTACTED';
    report.RESULT = 'PASS (LOCAL DOCKER PREFLIGHT)';
  } else {
    await deployRelease(profile, commit, builtRelease.releaseDirectory);
    report.RESULT = 'PASS';
  }
} catch (error) {
  report.RESULT = `FAIL (${error.message})`;
  process.exitCode = 1;
} finally {
  if (builtRelease) await rm(builtRelease.temporaryRoot, { recursive: true, force: true });
  printReport();
}
