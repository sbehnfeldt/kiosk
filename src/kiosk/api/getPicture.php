<?php
if ( empty( $_SERVER[ 'HTTP_X_REQUESTED_WITH' ]) || strtolower( $_SERVER[ 'HTTP_X_REQUESTED_WITH' ]) != 'xmlhttprequest' ) {
    die(0);
}
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
