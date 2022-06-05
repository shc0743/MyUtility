<?php
require_once('../verify.php');
if (!GetUserLogonInfo()) {
    header('Location: ../');
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
    <style>*{font-size:20px}</style>
</head>

<body>

<form action method="POST">
    <h1 style="font-size:42px">增加时间</h1>

    <div>
        增加: <br>
        <input name=h type=number required min=0 value=0 /> 时<br>
        <input name=m type=number required min=0 max=59 value=0 /> 分<br>
        <input name=s type=number required min=0 max=59 value=0 /> 秒
    </div>
    
    <p><button type="submit">确定</button></p>
</form>

</body>

</html>
