const fs = require('fs');
const path = require('path');

const appRoot = __dirname;

function loadEnvironmentFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separator = line.indexOf('=');
    if (separator < 1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvironmentFile(path.join(appRoot, '.env.production.local'));
loadEnvironmentFile(path.join(appRoot, '.env.production'));

const releaseDirectory = process.env.FUCHA_RELEASE_DIR || path.join(appRoot, 'release');
const releaseServer = path.join(releaseDirectory, 'server.js');

if (!fs.existsSync(releaseServer)) {
  throw new Error(`Release not found at ${releaseServer}. Upload a locally built release before restarting Passenger.`);
}

process.chdir(releaseDirectory);
require(releaseServer);
