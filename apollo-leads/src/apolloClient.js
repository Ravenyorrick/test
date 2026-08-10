'use strict';

const DEFAULT_BASE_URL = 'https://api.apollo.io/api/v1';

class ApolloApiError extends Error {
  constructor(status, message, body, endpoint) {
    const detail = typeof message === 'string' && message.trim()
      ? message
      : `HTTP ${status}`;
    super(`Apollo API Error ${status}\n\n${detail}`);
    this.name = 'ApolloApiError';
    this.status = status;
    this.body = body;
    this.endpoint = endpoint;
  }
}

function redactHeaders(headers) {
  const safe = { ...headers };
  for (const key of Object.keys(safe)) {
    if (/api[-_]?key|authorization|cookie|token|secret/i.test(key)) {
      safe[key] = '[REDACTED]';
    }
  }
  return safe;
}

function extractErrorMessage(body) {
  if (!body) return '';
  if (typeof body === 'string') return body;
  if (body.error) {
    if (typeof body.error === 'string') return body.error;
    if (body.error.message) return body.error.message;
  }
  if (body.error_message) return body.error_message;
  if (body.message) return body.message;
  if (Array.isArray(body.errors)) {
    return body.errors
      .map((e) => (typeof e === 'string' ? e : JSON.stringify(e)))
      .join('\n');
  }
  if (body.errors && typeof body.errors === 'object') {
    return Object.entries(body.errors)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
      .join('\n');
  }
  try {
    return JSON.stringify(body, null, 2);
  } catch {
    return String(body);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class ApolloClient {
  /**
   * @param {object} options
   * @param {string} [options.apiKey]
   * @param {string} [options.baseUrl]
   * @param {number} [options.maxRetries]
   * @param {boolean} [options.debug]
   * @param {(info: object) => void} [options.onDebug]
   */
  constructor(options = {}) {
    const apiKey = options.apiKey || process.env.APOLLO_API_KEY;
    if (!apiKey || String(apiKey).trim() === '') {
      throw new Error(
        'APOLLO_API_KEY is missing. Set the APOLLO_API_KEY environment variable or pass apiKey to ApolloClient.'
      );
    }

    this.apiKey = apiKey;
    this.baseUrl = (options.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
    this.maxRetries = options.maxRetries ?? 5;
    this.debug = Boolean(options.debug ?? process.env.DEBUG === 'true');
    this.onDebug = options.onDebug || null;
  }

  _logDebug(info) {
    if (!this.debug && !this.onDebug) return;
    const payload = {
      timestamp: new Date().toISOString(),
      ...info,
    };
    if (this.onDebug) this.onDebug(payload);
    if (this.debug) {
      // Never log credentials
      console.error('[apollo-leads:debug]', JSON.stringify(payload));
    }
  }

  /**
   * @param {string} method
   * @param {string} path
   * @param {object} [options]
   * @param {object} [options.query]
   * @param {object} [options.body]
   * @param {boolean} [options.retryOn422=false]
   */
  async request(method, path, options = {}) {
    const endpoint = path.startsWith('http') ? path : `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    const url = new URL(endpoint);

    if (options.query && typeof options.query === 'object') {
      for (const [key, value] of Object.entries(options.query)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          for (const item of value) {
            url.searchParams.append(`${key}[]`, String(item));
          }
        } else if (typeof value === 'boolean' || typeof value === 'number') {
          url.searchParams.set(key, String(value));
        } else if (typeof value === 'object') {
          // Nested objects like revenue_range already flattened by callers
          url.searchParams.set(key, String(value));
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
      'x-api-key': this.apiKey,
    };

    let attempt = 0;
    let lastError;

    while (attempt <= this.maxRetries) {
      attempt += 1;
      const started = Date.now();

      try {
        const response = await fetch(url.toString(), {
          method,
          headers,
          body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        });

        const contentType = response.headers.get('content-type') || '';
        let body = null;
        const text = await response.text();
        if (text) {
          if (contentType.includes('application/json')) {
            try {
              body = JSON.parse(text);
            } catch {
              body = text;
            }
          } else {
            try {
              body = JSON.parse(text);
            } catch {
              body = text;
            }
          }
        }

        this._logDebug({
          endpoint: `${method} ${url.pathname}`,
          request_type: method,
          page: options.query?.page ?? options.body?.page ?? undefined,
          http_status: response.status,
          duration_ms: Date.now() - started,
          attempt,
          headers: redactHeaders({
            'Content-Type': headers['Content-Type'],
            Accept: headers.Accept,
          }),
        });

        if (response.status === 429) {
          const retryAfterHeader = response.headers.get('retry-after');
          const retryAfterSec = retryAfterHeader ? Number(retryAfterHeader) : NaN;
          const waitMs = Number.isFinite(retryAfterSec)
            ? retryAfterSec * 1000
            : Math.min(30000, 1000 * 2 ** (attempt - 1));

          this._logDebug({
            endpoint: `${method} ${url.pathname}`,
            request_type: method,
            http_status: 429,
            apollo_error: 'Rate limited; backing off',
            wait_ms: waitMs,
            attempt,
          });

          if (attempt > this.maxRetries) {
            throw new ApolloApiError(
              429,
              extractErrorMessage(body) || 'Rate limited by Apollo API',
              body,
              `${method} ${url.pathname}`
            );
          }

          await sleep(waitMs);
          continue;
        }

        if ([500, 502, 503].includes(response.status)) {
          if (attempt > this.maxRetries) {
            throw new ApolloApiError(
              response.status,
              extractErrorMessage(body) || `Apollo server error ${response.status}`,
              body,
              `${method} ${url.pathname}`
            );
          }
          await sleep(Math.min(30000, 1000 * 2 ** (attempt - 1)));
          continue;
        }

        if (!response.ok) {
          const message = extractErrorMessage(body);
          // 422 is a validation error — do not retry the same broken request
          throw new ApolloApiError(
            response.status,
            message,
            body,
            `${method} ${url.pathname}`
          );
        }

        return {
          status: response.status,
          headers: response.headers,
          data: body,
        };
      } catch (err) {
        lastError = err;
        if (err instanceof ApolloApiError) {
          if (err.status === 422 || err.status === 400 || err.status === 401 || err.status === 403 || err.status === 404) {
            throw err;
          }
          if (err.status === 429) {
            // already handled above; rethrow if retries exhausted
            throw err;
          }
        }

        if (attempt > this.maxRetries) {
          throw err;
        }

        this._logDebug({
          endpoint: `${method} ${url.pathname}`,
          request_type: method,
          apollo_error: err.message,
          attempt,
        });
        await sleep(Math.min(30000, 1000 * 2 ** (attempt - 1)));
      }
    }

    throw lastError || new Error('Apollo request failed');
  }

  async post(path, options = {}) {
    return this.request('POST', path, options);
  }

  async get(path, options = {}) {
    return this.request('GET', path, options);
  }
}

module.exports = {
  ApolloClient,
  ApolloApiError,
  DEFAULT_BASE_URL,
};
