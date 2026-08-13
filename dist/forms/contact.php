<?php
/**
 * Contact form handler — server-side validation + mail
 */

declare(strict_types=1);

session_start();

require_once dirname(__DIR__) . '/includes/config.php';
$config = require __DIR__ . '/config.php';

function redirect_with(string $path, array $params = []): never
{
    $url = page_url($path);
    if ($params) {
        $url .= (str_contains($url, '?') ? '&' : '?') . http_build_query($params);
    }
    // For thank-you which is a path
    if (str_starts_with($path, '/')) {
        $url = rtrim(SITE_URL, '/') . $path;
        if ($params) {
            $url .= '?' . http_build_query($params);
        }
    }
    header('Location: ' . $url);
    exit;
}

function clean_header_value(string $value): string
{
    return str_replace(["\r", "\n", "%0a", "%0d"], '', $value);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . page_url('/contact/'));
    exit;
}

// Honeypot
if (!empty($_POST['company'])) {
    redirect_with('/thank-you/'); // pretend success
}

// CSRF
$token = $_POST['csrf_token'] ?? '';
if (empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], (string) $token)) {
    redirect_with('/contact/', ['error' => 'invalid_session']);
}

// Rate limit
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rlKey = 'form_last_' . md5($ip);
$now = time();
$interval = (int) ($config['min_submit_interval'] ?? 10);
if (!empty($_SESSION[$rlKey]) && ($now - (int) $_SESSION[$rlKey]) < $interval) {
    redirect_with('/contact/', ['error' => 'too_fast']);
}

$first = trim((string) ($_POST['first-name'] ?? ''));
$last = trim((string) ($_POST['last-name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$phone = trim((string) ($_POST['telephone'] ?? ''));
$zip = trim((string) ($_POST['zipcode'] ?? ''));
$service = trim((string) ($_POST['service'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

$allowedServices = [
    'Electrical Service & Repair',
    'Security Cameras and Lighting',
    'Swimming Pool & Hot Tub Electrical',
    'Commercial Electrical Services',
    'Generators',
];

$errors = [];
if ($first === '' || strlen($first) > 100) {
    $errors[] = 'first-name';
}
if ($last === '' || strlen($last) > 100) {
    $errors[] = 'last-name';
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 200) {
    $errors[] = 'email';
}
if ($phone !== '' && !preg_match('/^[0-9+\-\(\)\s\.]{7,40}$/', $phone)) {
    $errors[] = 'telephone';
}
if ($zip !== '' && strlen($zip) > 20) {
    $errors[] = 'zipcode';
}
if ($service === '' || !in_array($service, $allowedServices, true)) {
    $errors[] = 'service';
}
if (strlen($message) > 5000) {
    $errors[] = 'message';
}

if ($errors) {
    redirect_with('/contact/', ['error' => 'validation']);
}

$_SESSION[$rlKey] = $now;

$safeFirst = clean_header_value($first);
$safeLast = clean_header_value($last);
$safeEmail = clean_header_value($email);
$subject = clean_header_value(($config['site_name'] ?? 'Website') . ' — New Lead: ' . $service);

$bodyLines = [
    'New website inquiry',
    '===================',
    'Name: ' . $safeFirst . ' ' . $safeLast,
    'Email: ' . $safeEmail,
    'Phone: ' . $phone,
    'ZIP: ' . $zip,
    'Service: ' . $service,
    'Source: ' . clean_header_value((string) ($_POST['form_source'] ?? '')),
    'IP: ' . $ip,
    'Time: ' . gmdate('c'),
    '',
    'Message:',
    $message !== '' ? $message : '(none)',
];
$body = implode("\n", $bodyLines);

$to = $config['destination_email'] ?? '';
$from = $config['sender_email'] ?? ('noreply@' . ($_SERVER['HTTP_HOST'] ?? 'localhost'));
$fromName = $config['sender_name'] ?? 'Website';

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: ' . clean_header_value($fromName) . ' <' . clean_header_value($from) . '>',
    'Reply-To: ' . $safeEmail,
    'X-Mailer: PHP/' . phpversion(),
];

$sent = false;
if (is_string($to) && str_contains($to, '@') && !str_contains($to, 'YOURDOMAIN')) {
    $sent = @mail($to, $subject, $body, implode("\r\n", $headers));
} else {
    // Config not set — log locally for cPanel setup verification
    $logDir = dirname(__DIR__) . '/forms/logs';
    if (!is_dir($logDir)) {
        @mkdir($logDir, 0750, true);
    }
    @file_put_contents(
        $logDir . '/submissions.log',
        gmdate('c') . " CONFIG_PENDING\n" . $body . "\n\n",
        FILE_APPEND | LOCK_EX
    );
    $sent = true; // still show thank-you; admin must configure email
}

// Always rotate CSRF after attempt
$_SESSION['csrf_token'] = bin2hex(random_bytes(32));

$redirect = $config['success_redirect'] ?? '/thank-you/';
header('Location: ' . rtrim(SITE_URL, '/') . $redirect);
exit;
