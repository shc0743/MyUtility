<?php
require_once('verify.php');
if (!GetUserLogonInfo()) {
    header('Location: logon.php');
    die();
}

require_once('userfile.php');

if (!file_exists($datafile)) {
    $fp = fopen($datafile, 'w');
    if ($fp) {
        fwrite($fp, "<?php die(); ?>\n");
        fclose($fp);
    }
}

header('Content-Type: text/plain');

function query() {
    global $datafile;
    if (empty($_GET['q'])) {
        header('HTTP/1.1 400');
        echo 'Invalid query paramter';
        die();
    }
    $q = $_GET['q'];
    if ($q == 'LastState') {
        $fp = fopen($datafile, 'r');
        if (!$fp) {
            header('HTTP/1.1 500');
            die();
        }
        $str2 = '';
        while (($str = fgets($fp))) { $str2 = $str; }
        $beg = substr($str2, 0, 1);
        if ($beg == 'b') echo 'begin';
        else if ($beg == 'e') echo 'end';
        else if ($beg == "<") echo 'end';
        else echo 'unknown';
        fclose($fp);
    }
}

function read_all () {
    global $datafile;
    $fp = fopen($datafile, 'r');
    if (!$fp) {
        header('HTTP/1.1 500');
        die();
    }
    fgets($fp);
    while (($str = fgets($fp))) {
        echo($str);
    }
    fclose($fp);
}

if (!empty($_GET['type'])) {
    if ($_GET['type'] == 'query') query();
}

if (!empty($_GET['time']) && $_GET['time'] == 'all') read_all();

