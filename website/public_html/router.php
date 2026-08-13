<?php
# Dev router for PHP built-in server (cPanel uses .htaccess instead)
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');
$file = __DIR__ . $uri;
if ($uri !== '/' && is_file($file)) {
    return false;
}
if (is_dir($file) && is_file(rtrim($file, '/') . '/index.php')) {
    require rtrim($file, '/') . '/index.php';
    return true;
}
if ($uri === '/' || $uri === '') {
    require __DIR__ . '/index.php';
    return true;
}
if ($uri === '/sitemap.xml') { require __DIR__ . '/sitemap.php'; return true; }
if ($uri === '/robots.txt') { require __DIR__ . '/robots.php'; return true; }
http_response_code(404);
require __DIR__ . '/404.php';
return true;
