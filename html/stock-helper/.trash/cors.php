<?php


$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $_REQUEST['url']);
// curl_setopt($ch, CURLOPT_GET, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HEADER, 1);


$text = curl_exec($ch);

header('Access-Control-Allow-Origin: *');
echo $text;

curl_close($ch);


