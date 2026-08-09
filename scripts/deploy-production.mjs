import { execFile, spawn, spawnSync } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { mkdir, mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises';
import https from 'node:https';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';
import { createGzip } from 'node:zlib';
import { finished } from 'node:stream/promises';
import { createRequire } from 'node:module';

const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);
const mysql = require('mysql2/promise');
const root = process.cwd();
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const selfTest = args.includes('--self-test');
const valueFor = (flag) => {
  const index = args.indexOf(flag);
  return index < 0 ? null : args[index + 1];
};
const requestedCommit = valueFor('--commit');
const requestedPlatform = valueFor('--platform');
const expectedHomepageText = valueFor('--expect-text');
const rejectedHomepageText = valueFor('--reject-text');
const profilePath = process.env.FUCHA_DEPLOY_PROFILE || path.join(os.homedir(), '.config', 'fucha24', 'production.env');

for (const flag of ['--commit', '--platform', '--expect-text', '--reject-text']) {
  if (args.includes(flag) && !valueFor(flag)) throw new Error(`${flag} requires a value.`);
}
if (selfTest && (dryRun || requestedCommit || requestedPlatform || expectedHomepageText || rejectedHomepageText)) {
  throw new Error('--self-test cannot be combined with deployment options.');
}
if (!dryRun && requestedPlatform) throw new Error('--platform is only allowed with --dry-run.');

const report = Object.fromEntries([
  'COMMIT', 'BUILD', 'ARTIFACT', 'UPLOAD', 'ACTIVATE', 'OLD RELEASE',
  'OLD PROCESSES TERMINATED', 'NEW RELEASE', 'NEW PROCESS CWD', 'COLD START',
  'PRISMA PREFLIGHT', 'PENDING MIGRATIONS', 'DB BACKUP', 'MIGRATE DEPLOY', 'PRISMA VERIFY',
  'HTTPS', 'EXPECT TEXT', 'REJECT TEXT', 'RESULT',
].map((key) => [key, 'PENDING']));
let stage = 'PRECHECK';

function printReport() {
  console.log('\nDEPLOY REPORT');
  for (const [label, value] of Object.entries(report)) console.log(`${label}: ${value}`);
  if (report.RESULT.startsWith('FAIL')) {
    console.log(`STAGE: ${stage}`);
    console.log(`REASON: ${report.RESULT.replace(/^FAIL \(|\)$/g, '')}`);
  }
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
  const text = await readFile(profilePath, 'utf8');
  return Object.fromEntries(text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith('#')).map((line) => {
    const index = line.indexOf('=');
    if (index < 1) throw new Error(`Invalid deployment profile line: ${line}`);
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    return [key, value];
  }));
}

function assertProductionProfile(profile) {
  const required = ['FUCHA_PROD_SSH_HOST', 'FUCHA_PROD_SSH_USER', 'FUCHA_PROD_SSH_KEY', 'FUCHA_PROD_APP_ROOT', 'FUCHA_PROD_RELEASES_DIR', 'FUCHA_PROD_URL', 'FUCHA_PROD_BASIC_AUTH_USER', 'FUCHA_PROD_BASIC_AUTH_PASSWORD'];
  const missing = required.filter((key) => !profile[key] || profile[key].includes('REPLACE_'));
  if (missing.length) throw new Error(`Incomplete production profile: ${missing.join(', ')}`);
  if (new Set(['localhost', '127.0.0.1', '::1', 'mini', '192.168.1.62']).has(profile.FUCHA_PROD_SSH_HOST)) throw new Error('Refusing a local deployment target.');
  if (!/^https:\/\//.test(profile.FUCHA_PROD_URL)) throw new Error('FUCHA_PROD_URL must use https.');
  for (const key of ['FUCHA_PROD_APP_ROOT', 'FUCHA_PROD_RELEASES_DIR']) if (!profile[key].startsWith('/')) throw new Error(`${key} must be absolute.`);
}

function sshArguments(profile, command) {
  return ['-i', profile.FUCHA_PROD_SSH_KEY, '-p', profile.FUCHA_PROD_SSH_PORT || '22', '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes', `${profile.FUCHA_PROD_SSH_USER}@${profile.FUCHA_PROD_SSH_HOST}`, command];
}
async function remote(profile, command, capture = false) { return run('ssh', sshArguments(profile, command), { capture }); }

const parseEnvironment = (text) => Object.fromEntries(text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith('#') && line.includes('=')).map((line) => {
  const separator = line.indexOf('='); let value = line.slice(separator + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
  return [line.slice(0, separator).trim(), value];
}));

async function withProductionDatabase(profile, callback) {
  const encoded = await remote(profile, `cd ${shellQuote(profile.FUCHA_PROD_APP_ROOT)} && base64 .env.production | tr -d '\n'`, true);
  const environment = parseEnvironment(Buffer.from(encoded, 'base64').toString('utf8'));
  for (const key of ['MYSQL_HOST', 'MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD']) if (!environment[key]) throw new Error(`Production .env.production is missing ${key}.`);
  const probe = net.createServer(); await new Promise((resolve, reject) => { probe.once('error', reject); probe.listen(0, '127.0.0.1', resolve); });
  const port = probe.address().port; await new Promise((resolve) => probe.close(resolve));
  const tunnel = spawn('ssh', ['-i', profile.FUCHA_PROD_SSH_KEY, '-p', profile.FUCHA_PROD_SSH_PORT || '22', '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes', '-o', 'ExitOnForwardFailure=yes', '-N', '-L', `127.0.0.1:${port}:${environment.MYSQL_HOST}:${environment.MYSQL_PORT || '3306'}`, `${profile.FUCHA_PROD_SSH_USER}@${profile.FUCHA_PROD_SSH_HOST}`], { stdio: 'ignore' });
  try { await new Promise((resolve) => setTimeout(resolve, 800)); if (tunnel.exitCode !== null) throw new Error('Production SSH tunnel failed to start.'); return await callback({ environment, port, url: `mysql://${encodeURIComponent(environment.MYSQL_USER)}:${encodeURIComponent(environment.MYSQL_PASSWORD)}@127.0.0.1:${port}/${encodeURIComponent(environment.MYSQL_DATABASE)}` }); }
  finally { if (tunnel.exitCode === null) tunnel.kill('SIGTERM'); }
}

async function prismaCommand(argumentsList, environment, allowFailure = false) {
  try { const result = await execFileAsync(path.join(root, 'node_modules/.bin/prisma'), argumentsList, { cwd: root, env: environment, maxBuffer: 10 * 1024 * 1024 }); return { code: 0, output: `${result.stdout || ''}${result.stderr || ''}`.trim() }; }
  catch (error) { const result = { code: error.code || 1, output: `${error.stdout || ''}${error.stderr || ''}`.trim() }; if (allowFailure) return result; throw new Error(result.output || `Prisma command failed (${result.code}).`); }
}

async function deployPendingPrismaMigrations(profile, sourceDirectory) {
  const schema = path.join(sourceDirectory, 'prisma/schema.prisma');
  const migrationDirectory = path.join(sourceDirectory, 'prisma/migrations');
  let expected;
  try { expected = (await readdir(migrationDirectory, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort(); }
  catch (error) { if (error.code === 'ENOENT') throw new Error('Selected deployment commit lacks prisma/schema.prisma or prisma/migrations. Commit the approved Prisma baseline before deploying.'); throw error; }
  return withProductionDatabase(profile, async ({ environment, port, url }) => {
    const cliEnvironment = { ...process.env, DATABASE_URL: url };
    const statusBefore = await prismaCommand(['migrate', 'status', '--schema', schema], cliEnvironment, true);
    const connection = await mysql.createConnection({ host: '127.0.0.1', port, user: environment.MYSQL_USER, password: environment.MYSQL_PASSWORD, database: environment.MYSQL_DATABASE });
    const [history] = await connection.query('SELECT migration_name, finished_at, rolled_back_at FROM _prisma_migrations ORDER BY started_at'); await connection.end();
    if (history.some((row) => !row.finished_at || row.rolled_back_at) || history.some((row) => !expected.includes(row.migration_name))) throw new Error('Prisma migration history is failed or inconsistent; production deploy stopped.');
    const pending = expected.filter((name) => !history.some((row) => row.migration_name === name));
    report['PRISMA PREFLIGHT'] = 'PASS'; report['PENDING MIGRATIONS'] = pending.length ? pending.join(', ') : 'NONE';
    if (!pending.length) { const diff = await prismaCommand(['migrate', 'diff', '--from-url', url, '--to-schema-datamodel', schema, '--script'], cliEnvironment); if (diff.output !== '-- This is an empty migration.') throw new Error('Production schema drift detected; release activation stopped.'); report['DB BACKUP'] = 'SKIPPED (no pending migrations)'; report['MIGRATE DEPLOY'] = 'SKIPPED (no pending migrations)'; report['PRISMA VERIFY'] = 'PASS (no pending migrations; empty schema diff)'; return; }
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z'); const directory = '/Users/mini/Backups/Fucha24'; const backup = path.join(directory, `Fucha24-production-${stamp}-pre-migrate-deploy.sql.gz`); await mkdir(directory, { recursive: true, mode: 0o700 });
    const dumpScript = `set -eu\nread_env(){ sed -n \"s/^$1=//p\" .env.production | head -n 1; }\nMYSQL_PWD=\"$(read_env MYSQL_PASSWORD)\"; export MYSQL_PWD\nexec /usr/bin/mysqldump --host=\"$(read_env MYSQL_HOST)\" --port=\"$(read_env MYSQL_PORT)\" --user=\"$(read_env MYSQL_USER)\" --single-transaction --skip-lock-tables --routines --events --triggers --add-drop-table --add-drop-database --databases \"$(read_env MYSQL_DATABASE)\"`;
    const dump = spawn('ssh', ['-i', profile.FUCHA_PROD_SSH_KEY, '-p', profile.FUCHA_PROD_SSH_PORT || '22', '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes', `${profile.FUCHA_PROD_SSH_USER}@${profile.FUCHA_PROD_SSH_HOST}`, `cd ${shellQuote(profile.FUCHA_PROD_APP_ROOT)} && /bin/sh -s`], { stdio: ['pipe', 'pipe', 'pipe'] }); dump.stdin.end(dumpScript); const gzip = createGzip({ level: 9 }); const output = createWriteStream(backup, { mode: 0o600, flags: 'wx' }); dump.stdout.pipe(gzip).pipe(output); let stderr = ''; dump.stderr.on('data', (chunk) => { stderr += chunk; }); const [dumpCode] = await Promise.all([new Promise((resolve) => dump.once('close', resolve)), finished(output)]); if (dumpCode !== 0 || (await stat(backup)).size === 0) { await rm(backup, { force: true }); throw new Error(`Production DB backup failed. ${stderr.trim()}`); } await run('gzip', ['-t', backup]); report['DB BACKUP'] = `PASS (${backup})`;
    await prismaCommand(['migrate', 'deploy', '--schema', schema], cliEnvironment); report['MIGRATE DEPLOY'] = 'PASS';
    const statusAfter = await prismaCommand(['migrate', 'status', '--schema', schema], cliEnvironment); const diff = await prismaCommand(['migrate', 'diff', '--from-url', url, '--to-schema-datamodel', schema, '--script'], cliEnvironment); if (!statusAfter.output.includes('Database schema is up to date!') || diff.output !== '-- This is an empty migration.') throw new Error('Prisma post-migration verification failed; release activation stopped.'); report['PRISMA VERIFY'] = 'PASS';
  });
}

function releaseValidationScript(directory, commit) {
  return [
    `test -d ${shellQuote(directory)}`,
    `test -f ${shellQuote(`${directory}/server.js`)}`,
    `test -d ${shellQuote(`${directory}/.next`)}`,
    `test -d ${shellQuote(`${directory}/.next/static`)}`,
    `test -f ${shellQuote(`${directory}/.release.json`)}`,
    `grep -Fqx ${shellQuote(`  "commit": "${commit}",`)} ${shellQuote(`${directory}/.release.json`)}`,
  ].join('\n');
}

async function uploadRelease(profile, releaseDirectory, incomingRelease) {
  const sshCommand = ['ssh', ...sshArguments(profile, `tar -xzf - -C ${shellQuote(incomingRelease)}`)].map(shellQuote).join(' ');
  await run('/bin/sh', ['-c', `tar --no-xattrs -C ${shellQuote(releaseDirectory)} -czf - . | ${sshCommand}`]);
}

async function resolveCommit() {
  const commit = await run('git', ['rev-parse', '--verify', `${requestedCommit || 'HEAD'}^{commit}`], { capture: true });
  const onMain = await execFileAsync('git', ['merge-base', '--is-ancestor', commit, 'origin/main'], { cwd: root }).then(() => true).catch(() => false);
  if (!onMain && !dryRun) throw new Error(`${commit} is not contained in origin/main.`);
  return commit;
}

function localDockerPlatform() { return process.arch === 'arm64' ? 'linux/arm64' : 'linux/amd64'; }
async function detectProductionPlatform(profile) {
  const architecture = await remote(profile, 'uname -m', true);
  const platform = { x86_64: 'linux/amd64', amd64: 'linux/amd64', aarch64: 'linux/arm64', arm64: 'linux/arm64' }[architecture];
  if (!platform) throw new Error(`Unsupported production CPU architecture: ${architecture}`);
  return platform;
}

async function buildRelease(commit, platform) {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'fucha24-docker-release-'));
  const contextDirectory = path.join(temporaryRoot, 'context');
  const releaseDirectory = path.join(temporaryRoot, 'release');
  try {
    await mkdir(contextDirectory);
    await run('git', ['archive', '--format=tar', '--output', path.join(temporaryRoot, 'source.tar'), commit]);
    await run('tar', ['-xf', path.join(temporaryRoot, 'source.tar'), '-C', contextDirectory]);
    await run('docker', ['buildx', 'build', '--platform', platform, '--build-arg', `FUCHA_RELEASE_COMMIT=${commit}`, '--output', `type=local,dest=${releaseDirectory}`, '--file', path.join(contextDirectory, 'Dockerfile.release'), contextDirectory]);
    const metadata = JSON.parse(await readFile(path.join(releaseDirectory, '.release.json'), 'utf8'));
    if (metadata.commit !== commit) throw new Error('Local release metadata does not match commit.');
    await readFile(path.join(releaseDirectory, 'server.js'));
    await readFile(path.join(releaseDirectory, '.next', 'BUILD_ID'));
    report.BUILD = `PASS (${platform})`;
    report.ARTIFACT = 'PASS (isolated standalone release)';
    return { temporaryRoot, releaseDirectory, sourceDirectory: contextDirectory };
  } catch (error) { await rm(temporaryRoot, { recursive: true, force: true }); throw error; }
}

function cwdMatches(candidate, target) { return candidate === target; }

function existingReleaseDecision(metadata, commit, contentsComplete) {
  return Boolean(contentsComplete && metadata && metadata.commit === commit) ? 'REUSE' : 'FAIL';
}

async function terminateOldReleaseProcesses(profile, oldRelease, newRelease) {
  if (!oldRelease || oldRelease === newRelease) { report['OLD PROCESSES TERMINATED'] = 'NOT APPLICABLE'; return; }
  const scan = (action) => [
    'set -eu', `target=${shellQuote(oldRelease)}`,
    'for entry in /proc/[0-9]*; do', '  pid=${entry#/proc/}', '  cwd=$(readlink -f "$entry/cwd" 2>/dev/null || true)',
    '  test "$cwd" = "$target" || continue',
    action === 'term' ? '  test "$(readlink -f "$entry/cwd" 2>/dev/null || true)" = "$target" || continue\n  kill -TERM "$pid"' : '  printf "%s\\n" "$pid"',
    'done',
  ].join('\n');
  const before = await remote(profile, scan('list'), true);
  if (!before) { report['OLD PROCESSES TERMINATED'] = 'NONE'; return; }
  await remote(profile, scan('term'));
  for (let second = 0; second < 10; second += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    if (!(await remote(profile, scan('list'), true))) { report['OLD PROCESSES TERMINATED'] = `PASS (${before.split('\n').length})`; return; }
  }
  throw new Error(`old release process still alive after 10s (${oldRelease})`);
}

async function coldStartProductionApplication(profile) {
  const selector = `cloudlinux-selector --json --interpreter nodejs --user ${shellQuote(profile.FUCHA_PROD_SSH_USER)} --app-root ${shellQuote(profile.FUCHA_PROD_APP_ROOT)}`;
  await remote(profile, `set -eu\n${selector.replace('cloudlinux-selector ', 'cloudlinux-selector stop ')} >/dev/null\n${selector.replace('cloudlinux-selector ', 'cloudlinux-selector start ')} >/dev/null`);
}

async function smokeHomepage(profile) {
  const authorization = `Basic ${Buffer.from(`${profile.FUCHA_PROD_BASIC_AUTH_USER}:${profile.FUCHA_PROD_BASIC_AUTH_PASSWORD}`).toString('base64')}`;
  const target = new URL(`${profile.FUCHA_PROD_URL.replace(/\/$/, '')}/?_fucha_deploy=${Date.now()}`);
  const response = await new Promise((resolve, reject) => {
    const request = https.request(target, { method: 'GET', headers: { Authorization: authorization, 'Cache-Control': 'no-cache' }, timeout: 30_000 }, (result) => {
      let body = ''; result.setEncoding('utf8'); result.on('data', (chunk) => { body += chunk; }); result.on('end', () => resolve({ statusCode: result.statusCode, body }));
    });
    request.on('timeout', () => request.destroy(new Error('smoke test timed out'))); request.on('error', reject); request.end();
  });
  if (response.statusCode !== 200) throw new Error(`smoke test returned HTTP ${response.statusCode}`);
  if (expectedHomepageText && !response.body.includes(expectedHomepageText)) throw new Error('Homepage does not contain expected text.');
  if (rejectedHomepageText && response.body.includes(rejectedHomepageText)) throw new Error('Homepage contains rejected text.');
}

async function verifyNewProcess(profile, newRelease, oldRelease) {
  const script = [
    'set -eu', `new_release=${shellQuote(newRelease)}`, `old_release=${shellQuote(oldRelease || '')}`, 'new_pids=', 'old_pids=',
    'for entry in /proc/[0-9]*; do', '  pid=${entry#/proc/}', '  cwd=$(readlink -f "$entry/cwd" 2>/dev/null || true)',
    '  test "$cwd" = "$new_release" && new_pids="$new_pids $pid"', '  test -n "$old_release" && test "$cwd" = "$old_release" && old_pids="$old_pids $pid"', 'done',
    'test -n "$new_pids" || { echo "no process has new release CWD" >&2; exit 2; }', 'test -z "$old_pids" || { echo "old release process remains:$old_pids" >&2; exit 3; }', 'printf "%s\\n" "$new_pids"',
  ].join('\n');
  const pids = await remote(profile, script, true);
  report['NEW PROCESS CWD'] = `PASS (${newRelease}; PID${pids.trim().includes(' ') ? 's' : ''}${pids})`;
}

async function deployRelease(profile, commit, releaseDirectory) {
  const appRoot = profile.FUCHA_PROD_APP_ROOT;
  const releasesRoot = profile.FUCHA_PROD_RELEASES_DIR;
  const finalRelease = `${releasesRoot}/${commit}`;
  const incomingRelease = `${releasesRoot}/.${commit}.incoming-${process.pid}`;
  const currentLink = `${releasesRoot}/current`;
  const appReleaseLink = `${appRoot}/release`;
  stage = 'PRECHECK';
  await remote(profile, ['set -eu', `test -d ${shellQuote(appRoot)}`, `test -f ${shellQuote(`${appRoot}/server.js`)}`, `test -d ${shellQuote(releasesRoot)}`, `test -L ${shellQuote(appReleaseLink)}`, `test ! -e ${shellQuote(incomingRelease)}`].join('\n'));
  stage = 'UPLOAD';
  const exists = await remote(profile, `test -e ${shellQuote(finalRelease)} && printf yes || true`, true);
  if (exists === 'yes') {
    await remote(profile, `set -eu\n${releaseValidationScript(finalRelease, commit)}`);
    report.UPLOAD = 'REUSED (validated existing release)';
  } else {
    await remote(profile, `set -eu\nmkdir ${shellQuote(incomingRelease)}`);
    try {
      await uploadRelease(profile, releaseDirectory, incomingRelease);
      await remote(profile, `set -eu\n${releaseValidationScript(incomingRelease, commit)}\ntest ! -e ${shellQuote(finalRelease)}\nmv ${shellQuote(incomingRelease)} ${shellQuote(finalRelease)}`);
      report.UPLOAD = 'PASS';
    } catch (error) { throw new Error(`release upload/validation failed before activation: ${error.message}`); }
  }
  stage = 'ACTIVATE';
  const oldRelease = await remote(profile, `readlink -f ${shellQuote(appReleaseLink)}`, true);
  const token = `${process.pid}-${Date.now()}`;
  await remote(profile, [
    'set -eu', `ln -s ${shellQuote(finalRelease)} ${shellQuote(`${releasesRoot}/.current-next-${token}`)}`,
    `mv -Tf ${shellQuote(`${releasesRoot}/.current-next-${token}`)} ${shellQuote(currentLink)}`,
    `ln -s ${shellQuote(currentLink)} ${shellQuote(`${appRoot}/.release-next-${token}`)}`,
    `mv -Tf ${shellQuote(`${appRoot}/.release-next-${token}`)} ${shellQuote(appReleaseLink)}`,
    `test "$(readlink -f ${shellQuote(currentLink)})" = ${shellQuote(finalRelease)}`,
    `test "$(readlink -f ${shellQuote(appReleaseLink)})" = ${shellQuote(finalRelease)}`,
  ].join('\n'));
  report.ACTIVATE = 'PASS'; report['OLD RELEASE'] = oldRelease || 'NONE'; report['NEW RELEASE'] = finalRelease;
  stage = 'TERMINATE_OLD_PROCESS';
  await terminateOldReleaseProcesses(profile, oldRelease, finalRelease);
  stage = 'COLD_START';
  await coldStartProductionApplication(profile); report['COLD START'] = 'PASS (CloudLinux Selector)';
  stage = 'HTTPS_SMOKE';
  await smokeHomepage(profile); report.HTTPS = 'PASS (HTTP 200)'; report['EXPECT TEXT'] = expectedHomepageText ? 'PASS' : 'NOT REQUESTED'; report['REJECT TEXT'] = rejectedHomepageText ? 'PASS' : 'NOT REQUESTED';
  stage = 'VERIFY_PROCESS_CWD';
  await verifyNewProcess(profile, finalRelease, oldRelease);
}

function selfTestProcessSelection() {
  const oldRelease = '/releases/old'; const newRelease = '/releases/new';
  const fixture = [{ pid: '1', cwd: oldRelease }, { pid: '2', cwd: newRelease }, { pid: '3', cwd: '/other' }];
  const selected = fixture.filter(({ cwd }) => cwdMatches(cwd, oldRelease)).map(({ pid }) => pid);
  if (selected.join(',') !== '1' || cwdMatches(newRelease, oldRelease) || cwdMatches('/releases/old-child', oldRelease)) throw new Error('exact-CWD process selection self-test failed.');
  const commit = 'abc';
  if (existingReleaseDecision({ commit }, commit, true) !== 'REUSE'
    || existingReleaseDecision({ commit: 'other' }, commit, true) !== 'FAIL'
    || existingReleaseDecision({ commit }, commit, false) !== 'FAIL') throw new Error('release idempotency self-test failed.');
  console.log('PROCESS CWD FIXTURE: PASS (exact old release only)');
  console.log('IDEMPOTENCY FIXTURE: PASS (reuse only complete matching release)');
}

let builtRelease;
try {
  if (selfTest) { selfTestProcessSelection(); report.RESULT = 'PASS (LOCAL FIXTURE)'; }
  else {
    stage = 'PRECHECK'; const commit = await resolveCommit(); report.COMMIT = commit;
    const profile = dryRun ? null : await loadProfile(); if (profile) assertProductionProfile(profile);
    const platform = dryRun ? (requestedPlatform || localDockerPlatform()) : await detectProductionPlatform(profile);
    stage = 'BUILD'; builtRelease = await buildRelease(commit, platform);
    if (dryRun) {
      report.UPLOAD = 'SKIPPED (--dry-run)'; report.ACTIVATE = 'SKIPPED'; report['OLD RELEASE'] = 'NOT CONTACTED'; report['OLD PROCESSES TERMINATED'] = 'SKIPPED'; report['NEW RELEASE'] = 'NOT CONTACTED'; report['NEW PROCESS CWD'] = 'SKIPPED'; report['COLD START'] = 'SKIPPED'; report['PRISMA PREFLIGHT'] = 'SKIPPED (--dry-run)'; report['PENDING MIGRATIONS'] = 'SKIPPED'; report['DB BACKUP'] = 'SKIPPED'; report['MIGRATE DEPLOY'] = 'SKIPPED'; report['PRISMA VERIFY'] = 'SKIPPED'; report.HTTPS = 'SKIPPED'; report['EXPECT TEXT'] = 'SKIPPED'; report['REJECT TEXT'] = 'SKIPPED'; report.RESULT = 'PASS (LOCAL DOCKER PREFLIGHT)';
    } else { stage = 'PRISMA'; await deployPendingPrismaMigrations(profile, builtRelease.sourceDirectory); await deployRelease(profile, commit, builtRelease.releaseDirectory); report.RESULT = 'PASS'; }
  }
} catch (error) { report.RESULT = `FAIL (${error.message})`; process.exitCode = 1; }
finally { if (builtRelease) await rm(builtRelease.temporaryRoot, { recursive: true, force: true }); printReport(); }
