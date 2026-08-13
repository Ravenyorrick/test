<?php
/**
 * Mail / form configuration for cPanel hosting.
 * Copy values below for your domain. Do NOT commit real SMTP passwords to public repos.
 */

declare(strict_types=1);

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) {
    http_response_code(403);
    exit('Forbidden');
}

return [
    // Required: where form submissions are delivered
    'destination_email' => 'info@YOURDOMAIN.com',

    // From address (must be allowed by your host)
    'sender_email' => 'noreply@YOURDOMAIN.com',
    'sender_name' => 'Innovet Electric Inc. Website',

    'site_name' => 'Innovet Electric Inc.',

    // Optional SMTP (leave enabled=false to use PHP mail())
    'smtp' => [
        'enabled' => false,
        'host' => 'mail.YOURDOMAIN.com',
        'port' => 587,
        'encryption' => 'tls', // tls|ssl|none
        'username' => '',
        'password' => '',
    ],

    // Redirect after successful submit
    'success_redirect' => '/thank-you/',

    // Basic rate limiting (per IP, seconds between submissions)
    'min_submit_interval' => 10,
];
