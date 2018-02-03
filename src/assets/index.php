<?php
function my_autoload($className)
{

    $slash     = "\\";
    $className = ltrim($className, $slash);
    $fileName  = '';
    $namespace = '';
    if ($lastNsPos = strripos($className, $slash)) {
        $namespace = substr($className, 0, $lastNsPos);
        $className = substr($className, $lastNsPos + 1);
        $fileName  = str_replace($slash, DIRECTORY_SEPARATOR,
                $namespace) . DIRECTORY_SEPARATOR;
    }
    $fileName .= str_replace('_', DIRECTORY_SEPARATOR, $className) . '.php';

    $require = INSTALL . DIRECTORY_SEPARATOR . 'classes' . DIRECTORY_SEPARATOR . $fileName;
    require $require;
}


/********************************************************************************
 * Main Script
 ********************************************************************************/
define('INSTALL', dirname(__DIR__));
ini_set('error_log', INSTALL . '/logs/php_errors.log');
session_save_path(INSTALL . '/sessions');
session_start();


require_once INSTALL . '/vendor/autoload.php';
spl_autoload_register('my_autoload');


$config = file_get_contents(INSTALL . '/config.json');
$json   = json_decode($config, true);


Twig_Autoloader::register();
$loader = new Twig_Loader_Filesystem(INSTALL . '/templates');
$twig   = new Twig_Environment($loader, array(
    //'cache' => '../../templates/cache',
    'cache' => false,
));

$_SESSION[ 'picture_idx' ]      = -1;
$_SESSION[ 'announcement_idx' ] = -1;
$template                       = $twig->loadTemplate('index.html.twig');
$panels                         = array_filter($json[ 'panels' ],
    function ($panel) {
        return $panel[ 'active' ];
    });
echo $template->render([
    'cache'      => false,
    'panels'     => $panels,
    'dev'        => $json[ 'dev' ],
    'webroot'    => $json[ 'webroot' ],
    'configLink' => $_SERVER[ 'SERVER_ADDR' ] == $_SERVER[ 'REMOTE_ADDR' ]
]);
