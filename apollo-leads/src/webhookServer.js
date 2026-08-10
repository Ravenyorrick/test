'use strict';

const http = require('http');
const { EventEmitter } = require('events');

/**
 * Optional local webhook receiver for Apollo waterfall email results.
 *
 * Apollo requires a publicly accessible HTTPS webhook URL in production.
 * This local server is useful for development/testing (e.g. behind a tunnel).
 *
 * Handles duplicate deliveries via request_id + person id idempotency.
 */
class WaterfallWebhookHandler extends EventEmitter {
  constructor(options = {}) {
    super();
    this.port = options.port || 8787;
    this.path = options.path || '/webhooks/apollo';
    this.server = null;
    /** @type {Set<string>} */
    this.processedKeys = new Set();
    /** @type {Map<string, object>} */
    this.resultsByRequestId = new Map();
    /** @type {Map<string, object>} */
    this.resultsByPersonId = new Map();
    /** @type {Map<string, object>} */
    this.pendingByRequestId = new Map();
  }

  /**
   * Track a waterfall request so webhook results can be matched.
   * @param {string} requestId
   * @param {object} meta
   */
  trackRequest(requestId, meta = {}) {
    if (!requestId) return;
    this.pendingByRequestId.set(String(requestId), {
      ...meta,
      tracked_at: new Date().toISOString(),
    });
  }

  /**
   * Process an Apollo waterfall webhook payload idempotently.
   * @param {object} payload
   */
  handlePayload(payload) {
    if (!payload || typeof payload !== 'object') {
      return { accepted: false, duplicate: false, reason: 'invalid_payload' };
    }

    const requestId = payload.request_id ? String(payload.request_id) : null;
    const idempotencyKey = requestId
      ? `req:${requestId}`
      : `body:${JSON.stringify(payload).slice(0, 500)}`;

    if (this.processedKeys.has(idempotencyKey)) {
      this.emit('duplicate', { request_id: requestId, payload });
      return { accepted: true, duplicate: true, request_id: requestId };
    }

    this.processedKeys.add(idempotencyKey);
    if (requestId) {
      this.resultsByRequestId.set(requestId, payload);
    }

    const people = Array.isArray(payload.people) ? payload.people : [];
    const normalizedPeople = [];

    for (const person of people) {
      const personId = person.id ? String(person.id) : null;
      const emails = Array.isArray(person.emails) ? person.emails : [];
      const firstEmail = emails[0] || null;

      // Waterfall emails are business/work email coverage fallbacks
      const businessEmail = firstEmail?.email || null;
      const businessEmailStatus = firstEmail?.email_status_cd || firstEmail?.email_status || null;

      const record = {
        apollo_person_id: personId,
        business_email: businessEmail,
        business_email_status: businessEmailStatus,
        email_source: businessEmail ? 'apollo_waterfall' : 'none',
        request_id: requestId,
        credits_consumed: payload.credits_consumed,
        raw_person: person,
      };

      if (personId) {
        const personKey = requestId ? `req:${requestId}:person:${personId}` : `person:${personId}`;
        if (!this.processedKeys.has(personKey)) {
          this.processedKeys.add(personKey);
          this.resultsByPersonId.set(personId, record);
          normalizedPeople.push(record);
          this.emit('email', record);
        }
      } else {
        normalizedPeople.push(record);
        this.emit('email', record);
      }
    }

    const result = {
      accepted: true,
      duplicate: false,
      request_id: requestId,
      people: normalizedPeople,
      credits_consumed: payload.credits_consumed,
      status: payload.status,
      payload,
    };

    this.emit('result', result);
    return result;
  }

  /**
   * Wait for a waterfall result for a request_id.
   * @param {string} requestId
   * @param {number} [timeoutMs=120000]
   */
  waitForRequest(requestId, timeoutMs = 120000) {
    const id = String(requestId);
    if (this.resultsByRequestId.has(id)) {
      return Promise.resolve(this.resultsByRequestId.get(id));
    }

    return new Promise((resolve, reject) => {
      const onResult = (result) => {
        if (result.request_id === id) {
          cleanup();
          resolve(result.payload || result);
        }
      };

      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Timed out waiting for waterfall webhook request_id=${id}`));
      }, timeoutMs);

      const cleanup = () => {
        clearTimeout(timer);
        this.off('result', onResult);
      };

      this.on('result', onResult);
    });
  }

  start() {
    if (this.server) return Promise.resolve(this.address());

    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        if (req.method === 'GET' && req.url === '/health') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
          return;
        }

        const urlPath = (req.url || '').split('?')[0];
        if (req.method !== 'POST' || urlPath !== this.path) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Not found' }));
          return;
        }

        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => {
          let payload;
          try {
            payload = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
          } catch {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
            return;
          }

          const result = this.handlePayload(payload);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ received: true, duplicate: result.duplicate }));
        });
      });

      this.server.once('error', reject);
      this.server.listen(this.port, () => {
        resolve(this.address());
      });
    });
  }

  address() {
    if (!this.server) return null;
    const addr = this.server.address();
    return {
      port: typeof addr === 'object' ? addr.port : this.port,
      path: this.path,
      url: `http://127.0.0.1:${typeof addr === 'object' ? addr.port : this.port}${this.path}`,
    };
  }

  stop() {
    return new Promise((resolve) => {
      if (!this.server) return resolve();
      this.server.close(() => {
        this.server = null;
        resolve();
      });
    });
  }
}

module.exports = {
  WaterfallWebhookHandler,
};
