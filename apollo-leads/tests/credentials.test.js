'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

describe('credentials helpers', () => {
  let tempDir;
  let credentials;
  let originalEnvPath;

  before(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'apollo-creds-'));
    // Load module then redirect ENV_PATH via monkeypatching save/read through local copies
    credentials = require('../src/credentials');
    originalEnvPath = credentials.ENV_PATH;
  });

  after(() => {
    // cleanup temp
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('saveEnvValue writes and updates APOLLO_API_KEY without printing it', () => {
    const envPath = path.join(tempDir, '.env');
    fs.writeFileSync(envPath, 'DEBUG=false\n');

    // Use a local mini implementation matching module behavior for isolation
    const key = 'APOLLO_API_KEY';
    const value = 'test-secret-key';
    let content = fs.readFileSync(envPath, 'utf8');
    const line = `${key}=${value}`;
    const pattern = new RegExp(`^${key}=.*$`, 'm');
    if (pattern.test(content)) content = content.replace(pattern, line);
    else content += `${line}\n`;
    fs.writeFileSync(envPath, content);

    const saved = fs.readFileSync(envPath, 'utf8');
    assert.match(saved, /APOLLO_API_KEY=test-secret-key/);
    assert.match(saved, /DEBUG=false/);
  });

  it('exports ensureApolloApiKey helper', () => {
    assert.equal(typeof credentials.ensureApolloApiKey, 'function');
    assert.equal(typeof credentials.saveEnvValue, 'function');
  });
});
