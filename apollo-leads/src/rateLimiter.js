'use strict';

/**
 * Simple concurrency-limited task scheduler.
 */
class RateLimiter {
  /**
   * @param {object} [options]
   * @param {number} [options.concurrency=2]
   */
  constructor(options = {}) {
    this.concurrency = Math.max(1, options.concurrency ?? 2);
    this.active = 0;
    /** @type {Array<{ fn: Function, resolve: Function, reject: Function }>} */
    this.queue = [];
    this.paused = false;
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
    this._drain();
  }

  /**
   * @template T
   * @param {() => Promise<T>} fn
   * @returns {Promise<T>}
   */
  schedule(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this._drain();
    });
  }

  _drain() {
    if (this.paused) return;

    while (this.active < this.concurrency && this.queue.length > 0) {
      const job = this.queue.shift();
      this.active += 1;

      Promise.resolve()
        .then(() => job.fn())
        .then((result) => {
          this.active -= 1;
          job.resolve(result);
          this._drain();
        })
        .catch((err) => {
          this.active -= 1;
          job.reject(err);
          this._drain();
        });
    }
  }

  pending() {
    return this.queue.length;
  }

  running() {
    return this.active;
  }
}

module.exports = {
  RateLimiter,
};
