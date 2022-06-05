<?php
require_once('../verify.php');
require_once('../fileutil.php');

if (!GetUserLogonInfo()) {
    header('Location: ../');
    die();
}
if (!empty($_POST['type'])) {
    if ($_POST['type'] == 'all') {
        DirDeleteTree('../datas/');
        mkdir('../datas/');
    }
    else if ($_POST['type'] == 'today') {
        unlink('../datas/'.date('Y-m-d'));
    }
    else {
        unlink('../datas/'.$_POST['type']);
    }

    if (empty($_REQUEST['redirect'])) {
        header('Location: ../closeframe.html');
    } else {
        header('Location: '.$_REQUEST['redirect']);
    }
    die();
}
?>

<!DOCTYPE html>
<html lang="zh-cn">

<head>
    <meta charset="utf-8" />
    <title>pctr</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" type="text/css" href="../generic.css" />
    <style>*{font-size: 20px;}h1{font-size: 40px;}</style>
    <style>#f1 button{display: block;}</style>
</head>

<body>

<form action method="POST" id=f1>
    <h1 style="color:red">确定重置时间?</h1>
    <input type=hidden name=type value="all" id=i1 />
    <p hidden><button type="button" onclick="i1.value='today';f1.submit()">重置今日时间</button></p>
    <p><button type="submit">重置所有时间</button></p>
</form>

</body>

</html>
