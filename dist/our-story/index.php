<?php
require_once dirname(__DIR__) . '/includes/config.php';
header('Location: ' . page_url('/about/'), true, 301);
exit;
