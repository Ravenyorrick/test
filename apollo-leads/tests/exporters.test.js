'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { IncrementalExporter } = require('../src/exporters');

describe('IncrementalExporter', () => {
  it('saves each business email immediately to CSV', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'apollo-save-'));
    const filePath = path.join(dir, 'leads.csv');
    const saver = new IncrementalExporter(filePath);
    saver.start();

    assert.ok(fs.existsSync(filePath));
    assert.match(fs.readFileSync(filePath, 'utf8'), /Business Email/);

    const first = saver.saveLead({
      apollo_person_id: '1',
      first_name: 'Ada',
      last_name: 'Lovelace',
      name: 'Ada Lovelace',
      title: 'CEO',
      company: 'Example',
      business_email: 'ada@example.com',
      business_email_status: 'verified',
      email_source: 'apollo_native',
      enrichment_status: 'enriched',
      found_business_email: true,
    });

    assert.equal(first.saved, true);
    assert.equal(first.count, 1);
    assert.match(fs.readFileSync(filePath, 'utf8'), /ada@example.com/);

    const second = saver.saveLead({
      apollo_person_id: '2',
      name: 'Grace Hopper',
      business_email: 'grace@example.com',
      found_business_email: true,
      enrichment_status: 'enriched',
      email_source: 'apollo_native',
    });
    assert.equal(second.saved, true);
    assert.equal(second.count, 2);

    // Duplicate should not append again
    const dup = saver.saveLead({
      apollo_person_id: '1',
      business_email: 'ada@example.com',
      found_business_email: true,
    });
    assert.equal(dup.saved, false);
    assert.equal(dup.count, 2);

    const lines = fs.readFileSync(filePath, 'utf8').trim().split('\n');
    assert.equal(lines.length, 3); // header + 2 rows
  });

  it('ignores leads without business email when emailsOnly=true', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'apollo-save-'));
    const filePath = path.join(dir, 'leads.csv');
    const saver = new IncrementalExporter(filePath);
    saver.start();
    const result = saver.saveLead({
      apollo_person_id: 'x',
      name: 'No Email',
      found_business_email: false,
    });
    assert.equal(result.saved, false);
    assert.equal(saver.count(), 0);
  });
});
