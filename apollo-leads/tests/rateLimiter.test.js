'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { RateLimiter } = require('../src/rateLimiter');
const { WaterfallWebhookHandler } = require('../src/webhookServer');

describe('rateLimiter', () => {
  it('limits concurrency', async () => {
    const limiter = new RateLimiter({ concurrency: 2 });
    let running = 0;
    let maxRunning = 0;

    const tasks = Array.from({ length: 5 }, () =>
      limiter.schedule(async () => {
        running += 1;
        maxRunning = Math.max(maxRunning, running);
        await new Promise((r) => setTimeout(r, 30));
        running -= 1;
        return true;
      })
    );

    await Promise.all(tasks);
    assert.ok(maxRunning <= 2);
  });
});

describe('waterfall webhook idempotency', () => {
  it('handles duplicate webhook deliveries safely', () => {
    const handler = new WaterfallWebhookHandler();
    const payload = {
      request_id: 'req-1',
      status: 'success',
      people: [
        {
          id: 'person-1',
          emails: [{ email: 'a@co.com', email_status_cd: 'Verified' }],
        },
      ],
    };

    const first = handler.handlePayload(payload);
    const second = handler.handlePayload(payload);

    assert.equal(first.duplicate, false);
    assert.equal(second.duplicate, true);
    assert.equal(handler.resultsByPersonId.get('person-1').business_email, 'a@co.com');
    assert.equal(handler.resultsByPersonId.get('person-1').email_source, 'apollo_waterfall');
  });
});
