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

    $require = '../classes/' . $fileName;
    require $require;
}


/********************************************************************************
 * Main Script
 ********************************************************************************/
//define('INSTALL', dirname(__DIR__));
ini_set('error_log', '../logs/php_errors.log');
session_save_path('../sessions');
session_start();

$_SESSION[ 'picture_idx' ]      = -1;
$_SESSION[ 'announcement_idx' ] = -1;

require_once '../vendor/autoload.php';
spl_autoload_register('my_autoload');

$config = json_decode(file_get_contents('../config.json'), true);


define('INSTALL', dirname(__DIR__));
error_log(INSTALL);
Twig_Autoloader::register();
$loader = new Twig_Loader_Filesystem(INSTALL . '/templates');
$twig   = new Twig_Environment($loader, array(
    //'cache' => '../../templates/cache',
    'cache' => false,
));

$template = $twig->loadTemplate('index.html.twig');
$panels   = array_filter($config[ 'panels' ],
    function ($panel) {
        return $panel[ 'active' ];
    });
echo $template->render([
    'cache'      => false,
    'panels'     => $panels,
    'dev'        => $config[ 'dev' ],
    'webroot'    => $config[ 'webroot' ],
    'configLink' => $_SERVER[ 'SERVER_ADDR' ] != $_SERVER[ 'REMOTE_ADDR' ]
]);
