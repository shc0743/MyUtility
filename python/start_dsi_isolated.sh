#!/usr/bin/env bash
## This is an example file showing how to run `dsnative2.py` in an isolated environment
## Please edit the content before use to fit your system
shopt -s expand_aliases
alias mkuuid='cat /proc/sys/kernel/random/uuid'
alias dsi="DSIINSTANCEID=\$(mkuuid); INDIR=/data/data/com.termux/cache/workspace_\$DSIINSTANCEID; mkdir -p \$INDIR/linkerconfig/; cp /linkerconfig/ld.config.txt \$INDIR/linkerconfig/; mkdir -p \$INDIR/tmp/; cp ~/dsnative2.py \$INDIR/app.py; echo Booting instance \$DSIINSTANCEID ...; DEEPSEEK_API_KEY=\$(cat ~/skapikey.txt) proot -r \$INDIR -w \"/workspace\" -b $PREFIX -b /system -b /sys -b /vendor -b /apex -b /proc -b /dev -b /etc -b /mnt -b /product -b /sdcard -b \"\$(pwd):/workspace\" python3 /app.py; echo Instance \$DSIINSTANCEID finished with \$? ."
dsi

