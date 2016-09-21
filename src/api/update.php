<?php
ini_set('error_log', '../../logs/php_errors.log');


$config = file_get_contents( INSTALL . '/config.json' );
$json = json_decode( $config, true );

if ('dev' == $_GET['name']) {
    $json[ 'dev' ] = ($_GET['checked'] == 'true' );
}
for ( $i = 0; $i < count($json['panels']); $i++ ) {
    $panel =& $json[ 'panels'][ $i ] ;
    if ( $panel['tag'] == $_GET[ 'name' ]) {
        $panel['active'] = ($_GET[ 'checked' ] == 'true' );
        break;
    }
}


$f = fopen( INSTALL . '/config.json', 'w' );
fwrite( $f, json_encode($json));
fclose( $f );

echo(json_encode([]));
exit(0);

