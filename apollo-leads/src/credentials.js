'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const PACKAGE_ROOT = path.join(__dirname, '..');
const ENV_PATH = path.join(PACKAGE_ROOT, '.env');

/**
 * Read a value from the local .env file without printing secrets.
 * @param {string} key
 * @returns {string|null}
 */
function readEnvFileValue(key) {
  if (!fs.existsSync(ENV_PATH)) return null;
  const lines = fs.readFileSync(ENV_PATH, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const name = trimmed.slice(0, eq).trim();
    if (name !== key) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    return value || null;
  }
  return null;
}

/**
 * Upsert a key/value into .env, preserving other lines/comments.
 * @param {string} key
 * @param {string} value
 */
function saveEnvValue(key, value) {
  const line = `${key}=${value}`;
  let content = '';
  if (fs.existsSync(ENV_PATH)) {
    content = fs.readFileSync(ENV_PATH, 'utf8');
  } else {
    const examplePath = path.join(PACKAGE_ROOT, '.env.example');
    if (fs.existsSync(examplePath)) {
      content = fs.readFileSync(examplePath, 'utf8');
    } else {
      content = '# apollo-leads local settings\n';
    }
  }

  const pattern = new RegExp(`^${key}=.*$`, 'm');
  if (pattern.test(content)) {
    content = content.replace(pattern, line);
  } else {
    if (content.length && !content.endsWith('\n')) content += '\n';
    content += `${line}\n`;
  }

  fs.writeFileSync(ENV_PATH, content, { encoding: 'utf8', mode: 0o600 });
  try {
    fs.chmodSync(ENV_PATH, 0o600);
  } catch {
    // ignore on platforms that do not support chmod
  }

  return ENV_PATH;
}

function promptHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Prefer hidden input when TTY supports it
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;
    let hidden = false;

    if (stdin.isTTY) {
      hidden = true;
      stdin.setRawMode(true);
    }

    process.stdout.write(question);
    let value = '';

    const onData = (char) => {
      const c = char.toString('utf8');

      if (c === '\n' || c === '\r' || c === '\u0004') {
        if (hidden) stdin.setRawMode(Boolean(wasRaw));
        stdin.removeListener('data', onData);
        process.stdout.write('\n');
        rl.close();
        resolve(value.trim());
        return;
      }

      if (c === '\u0003') {
        if (hidden) stdin.setRawMode(Boolean(wasRaw));
        stdin.removeListener('data', onData);
        rl.close();
        process.stdout.write('\n');
        process.exit(1);
      }

      if (c === '\u007f' || c === '\b') {
        value = value.slice(0, -1);
        return;
      }

      value += c;
      if (!hidden) process.stdout.write(c);
    };

    if (hidden) {
      stdin.on('data', onData);
    } else {
      rl.question('', (answer) => {
        rl.close();
        resolve(String(answer || '').trim());
      });
    }
  });
}

function promptVisible(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(String(answer || '').trim());
    });
  });
}

/**
 * Ensure APOLLO_API_KEY is available.
 * Order: process.env → .env file → interactive prompt (then save to .env).
 *
 * @param {object} [options]
 * @param {boolean} [options.prompt=true]
 * @param {boolean} [options.save=true]
 * @returns {Promise<string>}
 */
async function ensureApolloApiKey(options = {}) {
  const promptEnabled = options.prompt !== false;
  const saveEnabled = options.save !== false;

  let key = process.env.APOLLO_API_KEY || readEnvFileValue('APOLLO_API_KEY');

  if (key && String(key).trim()) {
    process.env.APOLLO_API_KEY = String(key).trim();
    return process.env.APOLLO_API_KEY;
  }

  if (!promptEnabled || !process.stdin.isTTY) {
    throw new Error(
      'APOLLO_API_KEY is missing. Set it in .env or pass it interactively in a terminal.'
    );
  }

  console.log('');
  console.log('Apollo API key required.');
  console.log('Create one at: https://docs.apollo.io/docs/create-api-key');
  console.log('It will be saved locally to .env for next time (never committed).');
  console.log('');

  key = await promptHidden('Enter APOLLO_API_KEY: ');
  if (!key) {
    throw new Error('APOLLO_API_KEY is required to start extraction.');
  }

  process.env.APOLLO_API_KEY = key;

  if (saveEnabled) {
    const savedTo = saveEnvValue('APOLLO_API_KEY', key);
    console.log(`Saved API key to ${path.relative(process.cwd(), savedTo) || '.env'}`);
    console.log('');
  }

  return key;
}

/**
 * Prompt for a value if missing (visible input).
 */
async function ensureValue(name, current, question, options = {}) {
  if (current) return current;
  if (!process.stdin.isTTY || options.prompt === false) return current;
  const answer = await promptVisible(question);
  if (answer && options.saveEnvKey) {
    saveEnvValue(options.saveEnvKey, answer);
    process.env[options.saveEnvKey] = answer;
  }
  return answer || null;
}

module.exports = {
  ENV_PATH,
  readEnvFileValue,
  saveEnvValue,
  ensureApolloApiKey,
  ensureValue,
  promptHidden,
  promptVisible,
};
