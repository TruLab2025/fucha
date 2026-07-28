import { access, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

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
await writeFile(
  path.join(release, '.release.json'),
  `${JSON.stringify({ buildId: buildId.trim(), builtAt: new Date().toISOString() }, null, 2)}\n`,
);

console.log('Production release prepared in ./release');
