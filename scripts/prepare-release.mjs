import { access, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

if (process.env.FUCHA_RELEASE_BUILD !== '1') {
  throw new Error('Refusing to create a release in the active checkout. Use npm run deploy:production.');
}

const root = process.cwd();
const standalone = path.join(root, '.next', 'standalone');
const staticAssets = path.join(root, '.next', 'static');
const publicAssets = path.join(root, 'public');
const release = path.join(root, 'release');

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(standalone))) {
  throw new Error('Missing .next/standalone. Enable standalone output and run next build first.');
}

await rm(release, { recursive: true, force: true });
await mkdir(release, { recursive: true });
await cp(standalone, release, { recursive: true });

if (await exists(publicAssets)) {
  await cp(publicAssets, path.join(release, 'public'), { recursive: true });
}

if (await exists(staticAssets)) {
  await mkdir(path.join(release, '.next'), { recursive: true });
  await cp(staticAssets, path.join(release, '.next', 'static'), { recursive: true });
}

const buildId = await readFile(path.join(root, '.next', 'BUILD_ID'), 'utf8');
const commit = process.env.FUCHA_RELEASE_COMMIT
  || (await execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: root })).stdout.trim();
const packageLock = await readFile(path.join(root, 'package-lock.json'));
const releaseMetadata = {
  commit,
  buildId: buildId.trim(),
  node: process.version,
  packageLockSha256: createHash('sha256').update(packageLock).digest('hex'),
  builtAt: new Date().toISOString(),
};

await writeFile(
  path.join(release, '.release.json'),
  `${JSON.stringify(releaseMetadata, null, 2)}\n`,
);

await mkdir(path.join(release, 'public'), { recursive: true });
await writeFile(
  path.join(release, 'public', '_fucha-release.json'),
  `${JSON.stringify(releaseMetadata, null, 2)}\n`,
);

console.log('Production release prepared in ./release');
