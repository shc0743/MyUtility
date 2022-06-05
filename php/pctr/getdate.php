<?php
header("Content-Type: text/plain");

echo "Default Timezone: ". date_default_timezone_get()."\n";
date_default_timezone_set("Asia/Shanghai");
echo "Current Timezone: Asia/Shanghai\n\n";

echo "Timestamp: ".time()."\n".
     "Date (Y-m-d) : ".date("Y-m-d")."\n".
     "Date (Y-m-d h:i:s) : ".date("Y-m-d h:i:s")."\n".
     '';

