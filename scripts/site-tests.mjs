/**
 * Static site smoke tests against a built preview or file listing.
 * Run after `npm run build`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import { spawn } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const uploadDir = path.join(root, 'cpanel-upload');

const routes = [
  '/',
  '/signature-advisory',
  '/overview-of-services',
  '/fractional-leaders',
  '/process-capability-assessments',
  '/ai-tools-implementation',
  '/tsg-coach',
  '/our-team',
  '/mike-s-bio',
  '/contact-us',
];

const requiredFiles = [
  'index.html',
  '.htaccess',
  'robots.txt',
  'sitemap.xml',
  'favicon.ico',
  'assets/images/logo.png',
  'assets/images/hero-home.jpg',
  'assets/icons/linkedin.png',
];

const results = [];

function assert(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}${detail ? ` (${detail})` : ''}`);
}

// File checks
assert('cpanel-upload exists', fs.existsSync(uploadDir));
for (const f of requiredFiles) {
  assert(`has ${f}`, fs.existsSync(path.join(uploadDir, f)));
}
assert(
  'cpanel-upload.zip exists',
  fs.existsSync(path.join(root, 'dist', 'cpanel-upload.zip')),
);

const htaccess = fs.readFileSync(path.join(uploadDir, '.htaccess'), 'utf8');
assert('htaccess has SPA rewrite', htaccess.includes('RewriteRule ^ index.html'));

// Start a tiny static server that mimics Apache SPA fallback
function createServer(rootDir) {
  return http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    let filePath = path.join(rootDir, urlPath === '/' ? 'index.html' : urlPath);
    if (!filePath.startsWith(rootDir)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const types = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.xml': 'application/xml',
        '.txt': 'text/plain',
        '.ico': 'image/x-icon',
      };
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
    // SPA fallback
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(rootDir, 'index.html')).pipe(res);
  });
}

const server = createServer(uploadDir);
await new Promise((resolve) => server.listen(4177, resolve));
const base = 'http://127.0.0.1:4177';

async function get(pathname) {
  const res = await fetch(`${base}${pathname}`);
  const text = await res.text();
  return { status: res.status, text, headers: res.headers };
}

for (const route of routes) {
  const { status, text } = await get(route);
  assert(`route ${route} loads`, status === 200 && text.includes('root'), `status=${status}`);
}

// Direct asset
{
  const { status } = await get('/assets/images/logo.png');
  assert('logo asset loads', status === 200);
}

// Unknown route still returns SPA shell (cPanel behavior)
{
  const { status, text } = await get('/this-route-does-not-exist');
  assert('unknown route SPA fallback', status === 200 && text.includes('root'));
}

server.close();

const failed = results.filter((r) => !r.ok);
const report = [
  '# Final Test Report',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  `Total checks: ${results.length}`,
  `Passed: ${results.filter((r) => r.ok).length}`,
  `Failed: ${failed.length}`,
  '',
  '| Check | Status | Detail |',
  '|-------|--------|--------|',
  ...results.map((r) => `| ${r.name} | ${r.ok ? 'PASS' : 'FAIL'} | ${r.detail || ''} |`),
  '',
  '## Routes verified',
  ...routes.map((r) => `- ${r}`),
  '',
  '## Notes',
  '- Contact CTAs use mailto links (parity with original Wix site).',
  '- SPA deep links rely on included `.htaccess` rewrite rules on Apache/cPanel.',
  '- Production package: `dist/cpanel-upload.zip` and `cpanel-upload/`.',
  '',
].join('\n');

fs.writeFileSync(path.join(root, 'docs', 'final-test-report.md'), report);
console.log(`\nWrote docs/final-test-report.md (${failed.length} failed)`);
process.exit(failed.length ? 1 : 0);
