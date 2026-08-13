<?php
require_once __DIR__ . '/includes/config.php';
header('Content-Type: text/plain; charset=UTF-8');
echo "User-agent: *\nAllow: /\n\nSitemap: " . SITE_URL . "/sitemap.xml\n";
