<?php
ini_set( 'error_log', '../php_errors.log' );
session_start();

if ( !empty( $_SERVER[ 'HTTP_X_REQUESTED_WITH' ]) && strtolower( $_SERVER[ 'HTTP_X_REQUESTED_WITH' ]) == 'xmlhttprequest' ) {
	header( 'Content-type: application/json' );

	if ( isset( $_POST[ 'delete' ] )) {
		if ( unlink( 'gallery/' . $_POST[ 'img' ]) && unlink( 'gallery/thumbs/' . $_POST[ 'img' ] )) {
			echo json_encode( array( 'error' => false, 'message' => 'File deleted.' ));
		} else {
			echo json_encode( array( 'error' => true, 'message' => 'Unable to delete "' . $_POST[ 'img' ] . '"' ));
		}
		exit( 0 );
	}

	if ( isset( $_POST[ 'rotate' ] )) {
		$filename = 'gallery/' . $_POST[ 'img' ];

		$degrees = -$_POST[ 'degrees' ];
		$img = imagecreatefromjpeg( $filename );
		$rotate = imagerotate( $img, $degrees, 0 );
		if ( false == $rotate ) {
			die ( json_encode( array( 'error' => true, 'message' => 'fail' )));
		}
		imagejpeg( $rotate, $filename );
		imagedestroy( $rotate );
		imagedestroy( $img );

		$filename = 'gallery/thumbs/' . $_POST[ 'img' ];
		$img = imagecreatefromjpeg( $filename );
		$rotate = imagerotate( $img, $degrees, 0 );
		if ( false == $rotate ) {
			die ( json_encode( array( 'error' => true, 'message' => 'fail' )));
		}
		imagejpeg( $rotate, $filename );
		imagedestroy( $rotate );
		imagedestroy( $img );

		echo json_encode( array( 'error' => false, 'message' => 'Success!' ));
		exit( 0 );
	}

	die( json_encode( array( 'error' => true, 'message' => 'Unknown AJAX request' )));;

}
die( json_encode( array( 'error' => true, 'message' => 'No AJAX request.' )));;