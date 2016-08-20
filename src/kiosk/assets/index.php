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
ini_set('error_log', '../logs/php_errors.log');
define('INSTALL', dirname(__DIR__));
session_save_path(INSTALL . '../sessions');
session_start();


require_once INSTALL . '/vendor/autoload.php';
spl_autoload_register('my_autoload');


$config = file_get_contents('config.json');
$json   = json_decode($config, true);


require_once '../vendor/twig/twig/lib/Twig/Autoloader.php';
Twig_Autoloader::register();

$loader = new Twig_Loader_Filesystem('../templates');
$twig   = new Twig_Environment($loader, array(
    //'cache' => '../../templates/cache',
    'cache' => false,
));

// Routing: explode the incoming URI along the slashes and process accordingly
$webroot = $json['webroot'];
$uri     = $_SERVER['REQUEST_URI'];

$parts = explode('?', $uri);
$path  = $parts[0];
if (count($parts) > 1) {
    $qString = $parts[1];
} else {
    $qString = '';
}

$routes = substr($path, strlen($webroot));
$routes = explode('/', $routes);
$route  = array_shift($routes);

switch ($route) {
    case 'css':
        header('Content-Type: text/css');
        header('Content-Length: ' . filesize($route . '/' . $routes[0]));
        readfile($route . '/' . join('/', $routes));
        exit;

    case 'js':
        header('Content-Type: application/javascript');
        header('Content-Length: ' . filesize($route . '/' . $routes[0]));
        readfile($route . '/' . $routes[0]);
        exit;

    case '':
        $_SESSION['picture_idx']      = -1;
        $_SESSION['announcement_idx'] = -1;
        $template                     = $twig->loadTemplate('index.html.twig');
        $panels                       = array_filter($json['panels'],
            function ($panel) {
                return $panel['active'];
            });
        echo $template->render([
            'cache'  => false,
            'panels' => $panels,
            'dev'    => $json['dev'],
        ]);
        break;

    case 'config':
        $template = $twig->loadTemplate('config.html.twig');
        $panels   = array_filter($json['panels'], function ($panel) {
            return $panel['active'];
        });
        echo $template->render([
            'cache'   => false,
            'webroot' => $json['webroot'],
            'dev'     => $json['dev'],
            'panels'  => $json['panels']
        ]);
        break;

    case 'getThumbnails':
        include('../api/getThumbnails.php');
        break;

    case 'getPicture':
        include('../api/getPicture.php');
        break;

    case 'proxy':
        include('../api/proxy.php');
        break;

    case 'update':
        include('../api/update.php');
        break;

    case 'get':
        // Mobile devices seem to re-call this script before their .ajax calls (for some unknown reason),
        // so we need to protect the session variables from getting re-initialized.
        if ( ! isset($_SESSION['picture_idx'])) {
            $_SESSION['picture_idx'] = -1;
        }
        if ( ! isset($_SESSION['announcement_idx'])) {
            $_SESSION['announcement_idx'] = -1;
        }
        break;
    default:
        error_log($route);

        break;
}

exit(0);
