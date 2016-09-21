<?php
header('Content-type: application/xml');
global $qString;
$handle = fopen($qString, "r");

if ($handle) {
    while (!feof($handle)) {
        $buffer = fgets($handle, 4096);
        echo $buffer;
    }
    fclose($handle);
}
