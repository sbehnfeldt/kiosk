<?php
session_start();
ini_set( 'error_log', '../logs/php_errors.log' );

// Mobile devices seem to re-call this script before their .ajax calls (for some unknown reason),
// so we need to protect the session variables from getting re-initialized.
if ( ! isset( $_SESSION['picture_idx'] ) ) {
	$_SESSION['picture_idx'] = - 1;
}
if ( ! isset( $_SESSION['announcement_idx'] ) ) {
	$_SESSION['announcement_idx'] = - 1;
}
require_once '../vendor/twig/twig/lib/Twig/Autoloader.php';
Twig_Autoloader::register();

$loader = new Twig_Loader_Filesystem( '../templates' );
$twig   = new Twig_Environment( $loader, array(
	//'cache' => '../../templates/cache',
	'cache' => FALSE,
) );

$template = $twig->loadTemplate( 'index.twig' );
//echo $template->render( array( 'cache' => false, 'summer' => isset( $_GET[ 'summer' ])));
echo $template->render( [
	'cache'  => FALSE,
	'panels' => [
		[
			'id'        => 'update-123',
			'titleId'   => 'title-123',
			'title'     => 'Updates for the 123 class',
			'contentId' => 'content-123',
			'content'   => 'Retrieving latest update...'
		],
		[
			'id'        => 'update-abc',
			'titleId'   => 'title-abc',
			'title'     => 'Updates for the ABC class',
			'contentId' => 'content-abc',
			'content'   => 'Retrieving latest update...'
		],
		[
			'id'        => 'update-prek',
			'titleId'   => 'title-prek',
			'title'     => 'Updates for the Pre-K class',
			'contentId' => 'content-prek',
			'content'   => 'Retrieving latest update...'
		],
		[
			'id'        => 'update-lunch',
			'titleId'   => 'title-lunch',
			'title'     => 'Lunch',
			'contentId' => 'content-lunch',
			'content'   => 'Retrieving latest update...'
		]
	]
] );

