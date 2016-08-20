<?php
if ( !empty( $_SERVER[ 'HTTP_X_REQUESTED_WITH' ]) && strtolower( $_SERVER[ 'HTTP_X_REQUESTED_WITH' ]) == 'xmlhttprequest' ) {


	header( 'Content-type: application/json' );
	if ( isset( $_GET[ 'picture' ] )) {
		$extensions = array( 'jpg', 'jpeg', 'gif', 'png' );
		$files = scandir( 'gallery' );
		foreach ( $files as $i => $file ) {
			$ext = strtolower( end( explode( '.', $file )));
			if ( in_array( $ext, $extensions ) === false ) {
				unset( $files[ $i ] );
			}
		}
		sort( $files );
		$_SESSION[ 'picture_idx' ]++;
		if ( $_SESSION[ 'picture_idx' ] >= count( $files )) {
			$_SESSION[ 'picture_idx' ] = 0;
		}

		echo( json_encode( array( 'error' => false, 'src' => 'gallery/' . $files[ $_SESSION[ 'picture_idx' ]] )));
		exit;
	}

	if ( isset( $_GET[ 'announcement' ] )) {
		$extensions = array( 'txt', 'text', 'html' );
		$files = scandir( 'announcements' );
		foreach ( $files as $i => $file ) {
			if ( '_' == substr( $file, 0, 1 )) {
				unset( $files[ $i ] );
				continue;
			}
			$ext = strtolower( end( explode( '.', $file )));
			if ( in_array( $ext, $extensions ) === false ) {
				unset( $files[ $i ] );
			}
		}

		if ( 0 == count( $files )) {
			echo( json_encode( array( 'error' => false, 'src' => '' )));
			exit;
		}

		sort( $files );
		$_SESSION[ 'announcement_idx' ]++;
		if ( $_SESSION[ 'announcement_idx' ] >= count( $files )) {
			$_SESSION[ 'announcement_idx' ] = 0;
		}

		$file = 'announcements/' . $files[ $_SESSION[ 'announcement_idx' ]];
		$ext = strtolower( end( explode( '.', $file )));
		if (( $ext == 'txt' ) || ($ext == 'text' )) {
			$lines = file( 'announcements/' . $files[ $_SESSION[ 'announcement_idx' ]] );
			$src = array( );
			if ( $lines[ 0 ][ 0 ] == '!' ) {
				$src[ 0 ] = '<h2>' . ltrim ( $lines[ 0 ], '!')  . '</h2>';
				$i = 1;
			} else {
				$i = 0;
			}

			$b = false;
			while ( $i < count( $lines )) {
				if ( !in_array(  $lines[ $i ][ 0 ], array( "\r", "\n" ))) {
					if ( !$b ) {
						$src[] = '';
						$b = true;
					}
					$src[ count( $src ) - 1] .= $lines[ $i ];
				} else {
					if ( $b ) {
						$src[ count( $src ) - 1] = '<p>' . $src[ count( $src ) - 1] . '</p>';
						$b = false;
					}
				}
				$i++;
			}
			if ( $b ) {
				$src[ count( $src ) - 1] = '<p>' . $src[ count( $src ) - 1] . '</p>';
			}

			$src = implode( $src );

		} else {
			$src = file_get_contents( 'announcements/' . $files[ $_SESSION[ 'announcement_idx' ]] );
		}


		echo( json_encode( array( 'error' => false, 'src' => $src )));
		exit;
	}


	if ( isset( $_GET[ 'thumbnails' ])) {
		$extensions = array( 'jpg', 'jpeg', 'gif', 'png' );
		$files = scandir( 'gallery' );
		foreach ( $files as $i => $file ) {
			$ext = strtolower( end( explode( '.', $file )));
			if ( in_array( $ext, $extensions ) === false ) {
				unset( $files[ $i ] );
			}
		}
		sort( $files );
		for ( $i = 0; $i < count( $files ); $i++ ) {
			$files[ $i ] = 'gallery/thumbs/' . $files[ $i ];
		}

		echo( json_encode( array( 'error' => false, 'thumbs' => $files )));
		exit;
	}


	error_log( "Unknown AJAX request" );
	die( json_encode( array( 'error' => true, 'message' => 'Unknown AJAX request' )));;
}

die( json_encode( array( 'error' => true, 'message' => 'No AJAX request.' )));;
