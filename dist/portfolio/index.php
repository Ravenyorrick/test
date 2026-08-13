<?php
require_once dirname(__DIR__) . '/includes/config.php';
header('Location: ' . page_url('/gallery/'), true, 301);
exit;
