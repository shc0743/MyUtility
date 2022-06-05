<?php
require_once('userfile.php');

$cookie_key = 'pctr_d62bbfa1d418';

function WriteLog($text) {
    $log_file = 'log.php';
    if (!file_exists($log_file)) {
        $fp = fopen($log_file, 'w');
        if ($fp) {
            fwrite($fp, "<?php die(); ?>\n");
            fclose($fp);
        }
    }
    $fp = fopen($log_file, 'a');
    if ($fp) {
        fwrite($fp, $text);
        fwrite($fp, "\n");
        fclose($fp);
    }
}

function CheckUserLogonable($key) {
    global $userfile;
    $result = false;
    $fp = fopen($userfile, 'r');
    if ($fp) {
        $text = '';
        fgets($fp);
        while ($text = fgets($fp)) {
            $text = str_replace("\r", "", $text);
            $text = str_replace("\n", "", $text);
            if ($text == '') continue;
            if ($text == $key) {
                $result = true;
                break;
            }
        }
        fclose($fp);
    }
    return $result;
}

function LogonUser($key, $remember=false) {
    global $cookie_key;
    if (CheckUserLogonable($key)) {
        setcookie(
            $cookie_key, $key,
            $remember ? (time() + 60*60*24*360) : 0,
            '', '', false, true);
        return true;
    }
    else return false;
}

function LogoutUser() {
    global $cookie_key;
    setcookie($cookie_key, '', -1, '', '', false, true);
}

function GetUserLogonInfo() {
    global $cookie_key;
    if (!isset($_COOKIE[$cookie_key])) return false;
    $k = $_COOKIE[$cookie_key];
    return CheckUserLogonable($k);
}


