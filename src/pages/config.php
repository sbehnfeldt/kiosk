<?php
session_start();
ini_set('error_log', '../logs/php_errors.log');

require_once '../vendor/twig/twig/lib/Twig/Autoloader.php';
Twig_Autoloader::register();

$loader = new Twig_Loader_Filesystem('../templates');
$twig   = new Twig_Environment($loader, array(
    //'cache' => '../../templates/cache',
    'cache' => false,
));

$config = file_get_contents( 'config.json' );
$json = json_decode( $config, true );
$template = $twig->loadTemplate('config.html.twig');
echo $template->render([
    'cache'  => false,
    'panels' => $json[ 'panels']
    ]);
