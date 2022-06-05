<?php
require_once('verify.php');
if (GetUserLogonInfo()) {
    header('Location: ui.php');
    die();
}
header('Location: logon.php');

