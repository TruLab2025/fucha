import { execFile } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const root = process.cwd();
const nextCommand = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');

if (process.env.FUCHA_RELEASE_BUILD !== '1') {
  throw new Error(
    'Refusing to run a production build in this checkout. Use npm run deploy:production, which builds an exact commit in an isolated git worktree.',
  );
}

async function assertNoDevelopmentServerInThisCheckout() {
  const pidFile = path.join(root, '.fucha', 'dev.pid');

  try {
    await access(pidFile);
    const { pid } = JSON.parse(await readFile(pidFile, 'utf8'));
    if (!Number.isInteger(pid)) return;

    const { stdout } = await execFileAsync('ps', ['-p', String(pid), '-o', 'command=']);
    if (stdout.includes(nextCommand) && stdout.includes(' dev')) {
      throw new Error('A Fucha24 development server owns this checkout. Production builds must use the isolated deploy worktree.');
    }
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ESRCH') return;
    throw error;
  }
}

async function run(command, args) {
  await new Promise((resolve, reject) => {
    const child = execFile(command, args, { cwd: root, env: process.env }, (error) => {
      if (error) reject(error);
      else resolve();
    });
    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);
  });
}

await assertNoDevelopmentServerInThisCheckout();
await run(process.execPath, [nextCommand, 'build']);
await run(process.execPath, [path.join(root, 'scripts', 'prepare-release.mjs')]);
