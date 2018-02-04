<?php
session_start();
ini_set('error_log', '../logs/php_errors.log');

require_once '../vendor/autoload.php';

define('INSTALL', dirname(__DIR__));
error_log(INSTALL);
Twig_Autoloader::register();
$loader = new Twig_Loader_Filesystem(INSTALL . '/templates');
$twig   = new Twig_Environment($loader, array(
    //'cache' => '../../templates/cache',
    'cache' => false,
));

$config   = json_decode(file_get_contents('../config.json'), true);
$template = $twig->loadTemplate('config.html.twig');
exit($template->render([
    'cache'  => false,
    'panels' => $config[ 'panels' ],
    'webroot' => $config[ 'webroot' ]
]));
