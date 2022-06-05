<?php
require_once('verify.php');
if (!GetUserLogonInfo()) {
    header('Location: logon.php');
    die();
}

require_once('userfile.php');
if (empty($_REQUEST["type"]) ||
 ($_REQUEST["type"] != 'b' && $_REQUEST["type"] != 'e')) {
    header("HTTP/1.1 400");
    die();
}

if (!file_exists($datafile)) {
    $fp = fopen($datafile, 'w');
    if ($fp) {
        fwrite($fp, "<?php die(); ?>\n");
        fclose($fp);
    }
}

$timenow = strval(time());
if (isset($_REQUEST['time'])) {
    try {
        $timenow = intval($_REQUEST['time']);
        if (!$timenow) throw new Error;
    }
    catch (Error) {
        header("HTTP/1.1 400");
        die();
    }
}


$fp = fopen($datafile, "a+");
if (!$fp) {
    header("HTTP/1.1 500");
    die();
}
$type = substr($_REQUEST["type"], 0, 1);
if (!isset($_REQUEST['time'])) {
    try {
        $str = array_slice(file($datafile, FILE_IGNORE_NEW_LINES), -1)[0];
        if (substr($str, 0, 1) == 'b')
            $type = 'e';
        else if (substr($str, 0, 1) == 'e')
            $type = 'b';
        else if (substr($str, 0, 15) == '<?php die(); ?>')
            $type = 'b';
        else {
            fclose($fp);
            header("HTTP/1.1 400");
            die();
        }
    }
    catch (Error) {
        header("HTTP/1.1 500");
        die();
    }
}
fwrite($fp, $type);
fwrite($fp, $timenow);
fwrite($fp, "\n");
fclose($fp);
header("HTTP/1.1 206");
