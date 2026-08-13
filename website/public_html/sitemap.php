<?php
require_once __DIR__ . '/includes/config.php';
header('Content-Type: application/xml; charset=UTF-8');
$pages = [
  '/',
  '/about/',
  '/services/',
  '/services/electrical-services/',
  '/services/security-camera-services/',
  '/services/swimming-pool-electrician/',
  '/services/commercial-electrical-services/',
  '/services/generator-services/',
  '/areas-we-serve/',
  '/st-louis-mo/',
  '/webster-groves-mo/',
  '/gallery/',
  '/contact/',
  '/thank-you/',
  '/privacy-policy/',
];
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
foreach ($pages as $p) {
  $loc = rtrim(SITE_URL, '/') . ($p === '/' ? '/' : rtrim($p, '/') . '/');
  echo "  <url><loc>" . htmlspecialchars($loc, ENT_XML1) . "</loc></url>\n";
}
echo '</urlset>';
