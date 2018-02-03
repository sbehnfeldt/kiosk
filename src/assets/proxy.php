<?php
ini_set('error_log', '../logs/proxy.log');

header('Content-type: application/xml');

$qString  = $_GET[ 'url' ];
$tempfile = tempnam('./', '');
exec("wget -O $tempfile $qString");
readfile($tempfile);
unlink($tempfile);
