<?php
ini_set('error_log', '../logs/proxy.log');

header('Content-type: application/xml');
global $qString;
if ( !$qString ) {
    $qString = 'www.camelotschool.net/feed/';
}

$tempfile = 'rss.xml';
exec( "wget -O $tempfile $qString" );
exit(readfile($tempfile));
