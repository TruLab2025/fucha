import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const environmentPath = path.join(root, '.env.local');
const environment = { ...process.env };

try {
  const content = await readFile(environmentPath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (environment[key] === undefined) environment[key] = value;
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const host = environment.MYSQL_HOST;
const port = environment.MYSQL_PORT || '3306';
const database = environment.MYSQL_DATABASE;
const user = environment.MYSQL_USER;
const password = environment.MYSQL_PASSWORD;

if (!host || !database || !user || password === undefined) {
  throw new Error('Local Prisma requires MYSQL_HOST, MYSQL_DATABASE, MYSQL_USER and MYSQL_PASSWORD in .env.local.');
}
if (!['127.0.0.1', 'localhost', '::1'].includes(host)) {
  throw new Error(`Refusing non-local Prisma target: ${host}`);
}

environment.DATABASE_URL ||= `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(database)}`;

const prisma = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'prisma.cmd' : 'prisma');
const child = spawn(prisma, process.argv.slice(2), { cwd: root, env: environment, stdio: 'inherit' });
child.once('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exitCode = code ?? 1;
});
