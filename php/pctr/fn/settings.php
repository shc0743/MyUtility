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
</head>

<body>


</body>

</html>
