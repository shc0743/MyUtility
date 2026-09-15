#!/bin/bash
set -euo pipefail

if [ $# -eq 0 ]; then
    cat <<EOF
usage: "$0" command
EOF
    exit 1
fi

CUR_UID=$(id -u)
CUR_GID=$(id -g)
CUR_CTX=$(id -Z)

#exec sudo /system/bin/runcon "$CUR_CTX" /system/bin/unshare --net --setuid "$CUR_UID" --setgid "$CUR_GID" --setgroups=deny "$@"
exec $(realpath $(realpath $(dirname "$0"))/sudo) unshare --net --setuid "$CUR_UID" --setgid "$CUR_GID" --setgroups=deny "$@"


