#!/usr/bin/env bash
zcode() {
    if [ -z "$1" ]; then
        echo "Usage: zcode <filename>"
        return 1
    fi
    local zipfile="$HOME/output/$1.zip"
    if [ -f "$zipfile" ]; then
        rm -f "$zipfile"
    fi
    zip -rq -y "$zipfile" ./
}
