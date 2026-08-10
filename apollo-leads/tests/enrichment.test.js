'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { enrichPerson, buildEnrichmentDetails } = require('../src/peopleEnrichment');
const { bulkEnrichPeople, MAX_BULK_SIZE } = require('../src/bulkPeopleEnrichment');
const { normalizeLead } = require('../src/normalize');
const { EnrichmentCache } = require('../src/cache');
const { exportToCSV, exportToJSON } = require('../src/exporters');
const fs = require('fs');
const os = require('os');
const path = require('path');

describe('enrichment', () => {
  it('buildEnrichmentDetails prefers Apollo person ID and supporting identifiers', () => {
    const details = buildEnrichmentDetails({
      apollo_person_id: 'pid-1',
      first_name: 'Ada',
      last_name: 'Lovelace',
      company: 'Analytical Engines',
      company_domain: 'example.com',
      linkedin_url: 'https://linkedin.com/in/ada',
    });

    assert.equal(details.id, 'pid-1');
    assert.equal(details.first_name, 'Ada');
    assert.equal(details.organization_name, 'Analytical Engines');
    assert.equal(details.domain, 'example.com');
    assert.equal(details.linkedin_url, 'https://linkedin.com/in/ada');
  });

  it('stores Apollo email as business_email, not personal_email', async () => {
    const client = {
      async post(_path, options) {
        assert.equal(options.query.reveal_personal_emails, false);
        assert.equal(options.query.run_waterfall_email, undefined);
        return {
          status: 200,
          data: {
            person: {
              id: 'pid-1',
              first_name: 'Ada',
              last_name: 'Lovelace',
              name: 'Ada Lovelace',
              title: 'CEO',
              email: 'ada@example.com',
              email_status: 'verified',
              personal_emails: ['ada.personal@gmail.com'],
              organization: { name: 'Example Inc', primary_domain: 'example.com' },
              linkedin_url: 'https://linkedin.com/in/ada',
              city: 'London',
              country: 'United Kingdom',
            },
          },
        };
      },
    };

    const result = await enrichPerson(
      client,
      { apollo_person_id: 'pid-1', first_name: 'Ada' },
      { revealPersonalEmails: false }
    );

    assert.equal(result.lead.business_email, 'ada@example.com');
    assert.equal(result.lead.business_email_status, 'verified');
    // personal emails were returned by Apollo but reveal was false in query;
    // if present in response we still store separately and never overwrite business
    assert.notEqual(result.lead.business_email, result.lead.personal_email);
    assert.equal(result.lead.email_source, 'apollo_native');
    assert.equal(result.lead.found_business_email, true);
  });

  it('never sets business_email equal to personal_email when they match', () => {
    const lead = normalizeLead({
      enrichedPerson: {
        id: '1',
        email: 'shared@example.com',
        email_status: 'verified',
        personal_emails: ['shared@example.com'],
      },
    });
    assert.equal(lead.business_email, 'shared@example.com');
    assert.equal(lead.personal_email, null);
  });

  it('requires webhookUrl when runWaterfallEmail is true', async () => {
    const client = { async post() { return { data: {} }; } };
    await assert.rejects(
      () =>
        enrichPerson(client, { apollo_person_id: '1' }, { runWaterfallEmail: true }),
      /webhookUrl/
    );
  });

  it('bulk enrichment rejects more than 10 people', async () => {
    const client = { async post() { return { data: { matches: [] } }; } };
    const people = Array.from({ length: MAX_BULK_SIZE + 1 }, (_, i) => ({
      apollo_person_id: `id-${i}`,
    }));
    await assert.rejects(() => bulkEnrichPeople(client, people), /at most 10/);
  });

  it('bulk enrichment batches details with Apollo IDs', async () => {
    const client = {
      async post(path, options) {
        assert.equal(path, '/people/bulk_match');
        assert.equal(options.body.details.length, 2);
        assert.equal(options.body.details[0].id, 'a');
        return {
          data: {
            matches: [
              { id: 'a', email: 'a@co.com', email_status: 'verified', first_name: 'A' },
              { id: 'b', email: null, first_name: 'B' },
            ],
          },
        };
      },
    };

    const result = await bulkEnrichPeople(client, [
      { apollo_person_id: 'a', first_name: 'A' },
      { apollo_person_id: 'b', first_name: 'B' },
    ]);

    assert.equal(result.results[0].lead.business_email, 'a@co.com');
    assert.equal(result.results[1].lead.business_email, null);
    assert.equal(result.results[0].lead.email_source, 'apollo_native');
    assert.equal(result.results[1].lead.email_source, 'none');
  });

  it('cache skips re-enrichment when business_email exists', () => {
    const cache = new EnrichmentCache({ enabled: true, filePath: null });
    cache.set({
      apollo_person_id: 'p1',
      business_email: 'a@co.com',
      enrichment_status: 'enriched',
    });
    assert.equal(cache.shouldSkipEnrichment('p1'), true);
    assert.equal(cache.shouldSkipEnrichment('p1', { forceReEnrich: true }), false);
  });

  it('cache allows enrichMissingEmail retry when business email missing', () => {
    const cache = new EnrichmentCache({ enabled: true, filePath: null });
    cache.set({
      apollo_person_id: 'p2',
      business_email: null,
      enrichment_status: 'enriched',
    });
    assert.equal(cache.shouldSkipEnrichment('p2'), true);
    assert.equal(cache.shouldSkipEnrichment('p2', { enrichMissingEmail: true }), false);
  });

  it('exports CSV and JSON without inventing emails', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'apollo-leads-'));
    const leads = [
      {
        apollo_person_id: '1',
        first_name: 'Ada',
        last_name: 'Lovelace',
        name: 'Ada Lovelace',
        title: 'CEO',
        company: 'Example',
        company_domain: 'example.com',
        location: 'UK',
        business_email: 'ada@example.com',
        business_email_status: 'verified',
        personal_email: null,
        personal_email_status: null,
        linkedin_url: 'https://linkedin.com/in/ada',
        email_source: 'apollo_native',
        enrichment_status: 'enriched',
      },
    ];

    const csvPath = path.join(dir, 'leads.csv');
    const jsonPath = path.join(dir, 'leads.json');
    exportToCSV(leads, csvPath);
    exportToJSON(leads, jsonPath);

    const csv = fs.readFileSync(csvPath, 'utf8');
    assert.match(csv, /Business Email/);
    assert.match(csv, /ada@example.com/);
    assert.doesNotMatch(csv, /APOLLO_API_KEY|x-api-key/);

    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    assert.equal(json.count, 1);
    assert.equal(json.results[0].business_email, 'ada@example.com');
  });
});
