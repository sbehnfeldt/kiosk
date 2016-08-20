<?php
ini_set('error_log', '../../logs/php_errors.log');


$config = file_get_contents( 'config.json' );
$json = json_decode( $config, true );

for ( $i = 0; $i < count($json['panels']); $i++ ) {
    $panel =& $json[ 'panels'][ $i ] ;
    if ( $panel['tag'] == $_GET[ 'name' ]) {
        $panel['active'] = ($_GET[ 'checked' ] == 'true' );
        break;
    }
}

$f = fopen( 'config.json', 'w' );
fwrite( $f, json_encode($json));
fclose( $f );

echo(json_encode([]));
exit(0);

