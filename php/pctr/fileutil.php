<?php

function DirDeleteTree($dir) {
    if (rmdir($dir) == false && is_dir($dir)) {
        // echo $dir .' (1)<br>';
        if ($dp = opendir($dir)) {
            while (($file = readdir($dp)) !== false) {
                // echo $dir . '/' . $file .'<br>';
                if (is_dir($dir . '/' . $file) && $file != '.' && $file != '..') {
                    DirDeleteTree($dir . '/' . $file);
                } else if ($file != '.' && $file != '..') {
                    unlink($dir . '/' . $file);
                }
            }
            closedir($dp);
        } else {
            return false;
        }
        rmdir($dir);
    }
    return true;
}
