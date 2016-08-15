<?php
session_start();
ini_set('error_log', '../logs/php_errors.log');

// Mobile devices seem to re-call this script before their .ajax calls (for some unknown reason),
// so we need to protect the session variables from getting re-initialized.
if ( ! isset($_SESSION['picture_idx'])) {
    $_SESSION['picture_idx'] = -1;
}
if ( ! isset($_SESSION['announcement_idx'])) {
    $_SESSION['announcement_idx'] = -1;
}

$config = file_get_contents( 'config.json' );
$json = json_decode( $config, true );
$panels = array_filter( $json['panels'], function($panel) { return $panel['active']; });

require_once '../vendor/twig/twig/lib/Twig/Autoloader.php';
Twig_Autoloader::register();

$loader = new Twig_Loader_Filesystem('../templates');
$twig   = new Twig_Environment($loader, array(
    //'cache' => '../../templates/cache',
    'cache' => false,
));


$template = $twig->loadTemplate('index.html.twig');
//echo $template->render( array( 'cache' => false, 'summer' => isset( $_GET[ 'summer' ])));
echo $template->render([
    'cache'  => false,
    'panels' => $panels
]);

