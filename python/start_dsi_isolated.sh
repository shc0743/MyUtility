#!/usr/bin/env bash
## This is an example file showing how to run `dsnative2.py` in an isolated environment
## Please edit the content before use to fit your system
set -euo pipefail
shopt -s expand_aliases
alias mkuuid='cat /proc/sys/kernel/random/uuid'
#alias dsi="DSIINSTANCEID=\$(mkuuid); INDIR=/data/data/com.termux/cache/workspace_\$DSIINSTANCEID; mkdir -p \$INDIR/linkerconfig/; cp /linkerconfig/ld.config.txt \$INDIR/linkerconfig/; mkdir -p \$INDIR/tmp/; cp ~/dsnative2.py \$INDIR/app.py; echo Booting instance \$DSIINSTANCEID ...; DEEPSEEK_API_KEY=\$(cat ~/skapikey.txt) proot -r \$INDIR -w \"/workspace\" -b $PREFIX -b /system -b /sys -b /vendor -b /apex -b /proc -b /dev -b /etc -b /mnt -b /product -b /sdcard -b \"\$(pwd):/workspace\" python3 /app.py; echo Instance \$DSIINSTANCEID finished with \$? ."
#dsi

KEEP_DIR=false
SESSION_FILE=""
INSTANCE_DIR=""

# Display help
usage() {
    cat <<EOF
Usage: $0 [options] [session-file]
Options:
  -k, --keep     Keep the temporary working directory (default: auto-delete)
  -h, --help     Show this help message
Arguments:
  session-file   Optional JSON file to load/save conversation history
EOF
}

# Parse command line arguments
TEMP=$(getopt -o kh --long keep,help -n "$0" -- "$@")
eval set -- "$TEMP"
while true; do
    case "$1" in
        -k|--keep) KEEP_DIR=true; shift ;;
        -h|--help) usage; exit 0 ;;
        --) shift; break ;;
        *) echo "Internal error"; exit 1 ;;
    esac
done

# Remaining arguments: optional session file
if [[ $# -gt 1 ]]; then
    echo "Error: Ambiguous arguments. Only one session file is allowed, but multiple provided: $*" >&2
    exit 1
elif [[ $# -eq 1 ]]; then
    SESSION_FILE="$1"
    shift
fi

# Generate a unique instance ID
INSTANCE_ID=$(mkuuid)

# Define working directory
BASE_CACHE="/data/data/com.termux/cache"
INSTANCE_DIR="${BASE_CACHE}/workspace_${INSTANCE_ID}"

handle_save() {
    if [[ -f "$INSTANCE_DIR/session.txt" ]]; then
        if [[ -n "$SESSION_FILE" ]]; then
            # 有外部文件：直接复制回去
            cp "$INSTANCE_DIR/session.txt" "$SESSION_FILE"
            echo "会话已保存到 $SESSION_FILE"
        else
            # 无外部文件：询问用户是否保存
            read -p "退出，是否保存对话？ (y/n) " -r ans
            if [[ "$ans" =~ ^[Yy]$ ]]; then
                default_path="/sdcard/$(date +%Y%m%dT%H%M%S).json"
                read -p "保存到文件（回车为默认 $default_path）: " -r save_path
                if [[ -z "$save_path" ]]; then
                    save_path="$default_path"
                fi
                # 确保目标目录存在
                mkdir -p "$(dirname "$save_path")" || true
                if cp "$INSTANCE_DIR/session.txt" "$save_path"; then
                    echo "已保存到 $save_path"
                else
                    echo "保存失败，请检查路径权限"
                    TEMP_SAVE="$(mktemp)"
		    cp "$INSTANCE_DIR/session.txt" "$TEMP_SAVE" && echo "已临时缓存对话到 $TEMP_SAVE ,如有需要请及时处理"
                fi
            fi
        fi
    else
        echo "未找到会话文件 session.txt，可能未产生任何对话。"
    fi
}

# Cleanup function
cleanup() {
    handle_save
    if [[ "$KEEP_DIR" != true ]] && [[ -n "$INSTANCE_DIR" && -d "$INSTANCE_DIR" ]]; then
        echo "Cleaning up temporary directory: $INSTANCE_DIR"
        rm -rf "$INSTANCE_DIR"
    fi
}

# Create necessary subdirectories
mkdir -p "$INSTANCE_DIR"/{linkerconfig,tmp}

# Copy linker configuration file (if it exists)
if [[ -f /linkerconfig/ld.config.txt ]]; then
    cp /linkerconfig/ld.config.txt "$INSTANCE_DIR/linkerconfig/"
else
    echo "Warning: /linkerconfig/ld.config.txt not found, proot execution may be affected"
fi

# Copy Python script
if [[ -f ~/dsnative2.py ]]; then
    cp ~/dsnative2.py "$INSTANCE_DIR/app.py"
else
    echo "Error: ~/dsnative2.py not found" >&2
    exit 1
fi

cp "$(realpath "$0")" "$INSTANCE_DIR/startup.sh"

# If a session file is specified, copy it into the instance directory as history.txt
EXTRA_ARGS=()
if [[ -n "$SESSION_FILE" ]]; then
    if [[ -f "$SESSION_FILE" ]]; then
        cp "$SESSION_FILE" "$INSTANCE_DIR/history.txt"
        EXTRA_ARGS+=(--load=/history.txt)
    else
        echo "Warning: Session file $SESSION_FILE does not exist, ignoring load"
    fi
fi
# Regardless of existence, set --session argument (for saving on exit)
EXTRA_ARGS+=(--session=/session.txt)

# Read API key
if [[ -f ~/skapikey.txt ]]; then
    DEEPSEEK_API_KEY=$(cat ~/skapikey.txt)
else
    echo "Error: ~/skapikey.txt not found" >&2
    exit 1
fi
export DEEPSEEK_API_KEY

bindAiShared=()
if [[ -d "$HOME/ai-shared" ]]; then
    bindAiShared+=("-b")
    bindAiShared+=("$HOME/ai-shared")
fi

CWD="$(pwd)"

# Build proot command (note: /sdcard binding removed)
PROOT_CMD=(
    proot
    -r "$INSTANCE_DIR"
    -w "/workspace"
    -b "$PREFIX"
    "${bindAiShared[@]}"
    -b /system
    -b /sys
    -b /vendor
    -b /apex
    -b /proc
    -b /dev
    -b /etc
    -b /mnt
    -b /product
    -b "$CWD:/workspace"
    python3 /app.py "${EXTRA_ARGS[@]}"
)

echo "Booting instance $INSTANCE_ID ..."
"${PROOT_CMD[@]}"
RET=$?

# Set traps (EXIT covers normal exit and interrupts)
trap cleanup EXIT INT TERM

echo "Instance $INSTANCE_ID finished with $RET."

exit $RET
