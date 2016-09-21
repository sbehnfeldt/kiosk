<?php
if ( empty( $_SERVER[ 'HTTP_X_REQUESTED_WITH' ]) || strtolower( $_SERVER[ 'HTTP_X_REQUESTED_WITH' ]) != 'xmlhttprequest' ) {
    die(0);
}

header( 'Content-type: application/json' );
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
