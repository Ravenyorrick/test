import { app } from "electron";
import path from "node:path";
import type { BrowserContext, Page, Route } from "playwright";
import { chromium } from "playwright";

const BLOCKED_RESOURCE_TYPES = new Set(["image", "font", "media"]);
const BLOCKED_HOSTS = [/google-analytics/i, /segment/i, /intercom/i, /sentry/i, /doubleclick/i, /facebook/i, /hotjar/i];

export class BrowserService {
  private context?: BrowserContext;

  async getPage(): Promise<Page> {
    if (!this.context) {
      const userDataDir = path.join(app.getPath("userData"), "apollo-browser-profile");
      this.context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        viewport: { width: 1440, height: 1000 },
        userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
      });
      await this.context.route("**/*", (route) => this.route(route));
    }

    return this.context.pages()[0] ?? this.context.newPage();
  }

  async close(): Promise<void> {
    await this.context?.close();
    this.context = undefined;
  }

  private async route(route: Route): Promise<void> {
    const request = route.request();
    const url = request.url();
    if (BLOCKED_RESOURCE_TYPES.has(request.resourceType()) || BLOCKED_HOSTS.some((pattern) => pattern.test(url))) {
      await route.abort();
      return;
    }
    await route.continue();
  }
}
