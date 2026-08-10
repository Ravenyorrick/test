'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { ApolloExtractor } = require('../src');
const { ApolloApiError } = require('../src/apolloClient');

describe('ApolloExtractor job controls', () => {
  it('pause, resume, and stop retain completed results', async () => {
    let searchCalls = 0;

    const extractor = new ApolloExtractor({
      apiKey: 'test-key-not-real',
      maxPages: 5,
      perPage: 2,
      enrich: false,
      cache: false,
      concurrency: 1,
    });

    extractor.engine.client.post = async (_path, options) => {
      searchCalls += 1;
      const page = options.body.page;
      await new Promise((r) => setTimeout(r, 30));
      return {
        status: 200,
        data: {
          total_entries: 6,
          people: [
            { id: `p-${page}-1`, first_name: 'A', title: 'CEO', organization: { name: 'Co' } },
            { id: `p-${page}-2`, first_name: 'B', title: 'PM', organization: { name: 'Co' } },
          ],
        },
      };
    };

    const url =
      'https://app.apollo.io/#/people?personTitles[]=ceo&personLocations[]=United%20States';
    const job = extractor.extractFromUrl(url, { maxPages: 5, perPage: 2 });

    // Wait until first page people are recorded, then pause
    await new Promise((resolve) => {
      let seen = 0;
      job.on('person', () => {
        seen += 1;
        if (seen >= 2) {
          job.pause();
          resolve();
        }
      });
    });

    assert.equal(job.status, 'paused');
    const countAfterPause = job.results.length;
    assert.ok(countAfterPause >= 2, `expected >=2 results after pause, got ${countAfterPause}`);

    await new Promise((r) => setTimeout(r, 80));
    const pagesWhilePaused = job.stats.pages_fetched;

    job.resume();
    await new Promise((r) => setTimeout(r, 60));
    job.stop();

    const outcome = await job;
    assert.ok(outcome.results.length >= countAfterPause);
    assert.equal(job.status, 'stopped');
    assert.ok(pagesWhilePaused >= 1);
    assert.ok(searchCalls >= 1);
    // Completed results retained
    assert.ok(outcome.results.every((r) => r.apollo_person_id));
  });

  it('stops when emailLimit business emails are found', async () => {
    const extractor = new ApolloExtractor({
      apiKey: 'test-key-not-real',
      emailLimit: 3,
      enrich: true,
      cache: false,
      concurrency: 1,
      useBulk: true,
    });

    let searchCalls = 0;
    extractor.engine.client.post = async (path, options) => {
      if (path.includes('api_search')) {
        searchCalls += 1;
        const page = options.body.page;
        return {
          status: 200,
          data: {
            total_entries: 100,
            people: Array.from({ length: 5 }, (_, i) => ({
              id: `p-${page}-${i}`,
              first_name: `Person${page}${i}`,
              title: 'CEO',
              organization: { name: 'Co', primary_domain: 'co.com' },
            })),
          },
        };
      }

      // bulk_match
      const details = options.body.details || [];
      return {
        status: 200,
        data: {
          matches: details.map((d, idx) => ({
            id: d.id,
            first_name: 'X',
            last_name: 'Y',
            email: `user${d.id}@co.com`,
            email_status: 'verified',
            organization: { name: 'Co', primary_domain: 'co.com' },
          })),
        },
      };
    };

    const outcome = await extractor.extractFromUrl(
      'https://app.apollo.io/#/people?personTitles[]=ceo',
      { emailLimit: 3 }
    );

    assert.equal(outcome.reached_email_limit, true);
    assert.ok(outcome.stats.business_emails_found >= 3);
    assert.equal(outcome.results.length, 3);
    assert.ok(outcome.results.every((r) => r.business_email));
    // Should not keep searching forever after target is hit
    assert.ok(searchCalls <= 2);
  });

  it('surfaces Apollo 422 validation errors clearly', async () => {
    const extractor = new ApolloExtractor({
      apiKey: 'test-key-not-real',
      enrich: false,
      cache: false,
    });

    extractor.engine.client.post = async () => {
      throw new ApolloApiError(
        422,
        'person_titles requires an array',
        { error: 'person_titles requires an array' },
        'POST /mixed_people/api_search'
      );
    };

    const job = extractor.extractFromUrl(
      'https://app.apollo.io/#/people?personTitles[]=ceo'
    );

    await assert.rejects(() => job, /Apollo API Error 422[\s\S]*person_titles requires an array/);
  });
});
