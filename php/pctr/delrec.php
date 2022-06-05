<?php
require_once('verify.php');
if (!GetUserLogonInfo()) {
    header('Location: .');
    die();
}

if (!isset($_REQUEST['q'])) {
    header('HTTP/1.1 400');
    echo '{"code":400,"message":"87"}';
    die();
}

require_once("userfile.php");

if(!copy($datafile, $datafile.'.tmp.php')) {
    header("HTTP/1.1 500");
    echo '{"code":500}';
    die();
}
$fp = fopen($datafile.'.tmp.php', "r");
if (!$fp) {
    header("HTTP/1.1 500");
    echo '{"code":500}';
    die();
}
$fp2 = fopen($datafile, "w");
if (!$fp2) {
    fclose($fp);
    header("HTTP/1.1 500");
    echo '{"code":500}';
    die();
}

while ($str = fgets($fp)) {
    $str2 = str_replace("\r", "", $str);
    $str2 = str_replace("\n", "", $str2);
    if (strlen($str2) > 0 && substr($str2, 1) == $_REQUEST['q']) {
        // ignore
        if (substr($str2, 0, 1) == 'b') {
            $str = fgets($fp);
            if ($str != "\r\n" && $str != "\r" && $str != "\n") continue;
        }
        else continue;
    }

    fwrite($fp2, $str);
}

fclose($fp2);
fclose($fp);
unlink($datafile.'.tmp.php');

echo '{"code":200}';

