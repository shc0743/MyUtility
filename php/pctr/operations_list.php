<?php
require_once('verify.php');
if (!GetUserLogonInfo()) {
    header('HTTP/1.1 403');
    echo "{\"code\":403,\"message\":\"User not logoned.\"}";
    die();
}
?>
{
    "code": 200,
    "operations": {
        "增加记录": "fn/newrecui.php",
        "查看记录": "fn/records.php",
        "重置时间": "fn/resettime.php",
        "设置": "fn/settings.php"
    }
}