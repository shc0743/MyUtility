#!/usr/bin/env bash
node -e 'process.stdin.on("data",d=>process.stdout.write(String(d).replace(/(ls\s+?([\s\w\-_=]*?\s+?)*?-\w*?)l/gm,"$1F")))'
