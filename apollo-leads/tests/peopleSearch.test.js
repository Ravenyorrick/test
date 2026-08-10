'use strict';

const { describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');
const { searchPeople, extractSearchPerson } = require('../src/peopleSearch');

describe('peopleSearch', () => {
  it('sends array filters in the request body (prevents person_titles 422)', async () => {
    const calls = [];
    const client = {
      async post(path, options) {
        calls.push({ path, options });
        return {
          status: 200,
          data: {
            total_entries: 1,
            people: [
              {
                id: 'abc123',
                first_name: 'Ada',
                last_name_obfuscated: 'Lo***e',
                title: 'CEO',
                has_email: true,
                organization: { name: 'Example Inc' },
              },
            ],
          },
        };
      },
    };

    const result = await searchPeople(
      client,
      {
        person_titles: [
          'sales representative',
          'chief executive officer',
          'project manager',
        ],
        person_locations: ['United States'],
      },
      { page: 1, perPage: 25 }
    );

    assert.equal(calls.length, 1);
    assert.equal(calls[0].path, '/mixed_people/api_search');
    assert.deepEqual(calls[0].options.body.person_titles, [
      'sales representative',
      'chief executive officer',
      'project manager',
    ]);
    assert.deepEqual(calls[0].options.body.person_locations, ['United States']);
    assert.equal(calls[0].options.body.page, 1);
    assert.equal(calls[0].options.body.per_page, 25);
    assert.equal(result.people.length, 1);
    assert.equal(result.people[0].id, 'abc123');
  });

  it('extractSearchPerson captures Apollo person ID and company', () => {
    const extracted = extractSearchPerson({
      id: 'person-1',
      first_name: 'Ada',
      title: 'CEO',
      organization: { name: 'Example', primary_domain: 'example.com' },
      has_email: true,
    });

    assert.equal(extracted.apollo_person_id, 'person-1');
    assert.equal(extracted.company, 'Example');
    assert.equal(extracted.company_domain, 'example.com');
    assert.equal(extracted.has_email, true);
  });

  it('caps per_page at 100', async () => {
    const client = {
      async post(_path, options) {
        return { status: 200, data: { people: [], total_entries: 0, echo: options.body } };
      },
    };
    const result = await searchPeople(client, {}, { perPage: 500 });
    assert.equal(result.per_page, 100);
  });
});
