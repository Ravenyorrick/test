import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const uploadDir = path.join(root, 'cpanel-upload');
const zipPath = path.join(dist, 'cpanel-upload.zip');

if (!fs.existsSync(dist)) {
  console.error('dist/ not found. Run vite build first.');
  process.exit(1);
}

// Fresh cpanel-upload folder
fs.rmSync(uploadDir, { recursive: true, force: true });
fs.mkdirSync(uploadDir, { recursive: true });

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy production build into cpanel-upload
for (const entry of fs.readdirSync(dist)) {
  if (entry === 'cpanel-upload.zip') continue;
  copyRecursive(path.join(dist, entry), path.join(uploadDir, entry));
}

// Ensure .htaccess is present (Vite copies from public/)
const htaccessSrc = path.join(root, 'public', '.htaccess');
if (fs.existsSync(htaccessSrc)) {
  fs.copyFileSync(htaccessSrc, path.join(uploadDir, '.htaccess'));
}

// Create ZIP with contents at root of archive (not nested folder)
fs.mkdirSync(dist, { recursive: true });
fs.rmSync(zipPath, { force: true });
execSync(`cd "${uploadDir}" && zip -r "${zipPath}" . -x "*.DS_Store"`, {
  stdio: 'inherit',
});

console.log('cPanel package ready:');
console.log(' - Folder:', uploadDir);
console.log(' - ZIP:', zipPath);
