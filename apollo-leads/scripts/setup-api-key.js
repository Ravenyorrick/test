#!/usr/bin/env node
'use strict';

/**
 * Interactive helper: prompt for APOLLO_API_KEY and save it to .env
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { ensureApolloApiKey, ENV_PATH } = require('../src/credentials');

(async () => {
  delete process.env.APOLLO_API_KEY;
  await ensureApolloApiKey({ prompt: true, save: true });
  console.log('Done. Future extractions runs will reuse the saved key from:');
  console.log(ENV_PATH);
})().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
