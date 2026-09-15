#!/usr/bin/env bash

BLOCKED_COMMANDS_FILE="$HOME/ai-shared/blocked_commands.txt"
MANUAL_APPROVE_FILE="$HOME/ai-shared/apr"

# Network-block rule: if rules/block-network-enabled.txt exists next to this
# script, and its content is a number other than 0, run commands through
# fuck-network.sh instead of plain bash. Otherwise behave as before.
SCRIPT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
BLOCK_NETWORK_ENABLED=0
BLOCK_NETWORK_FLAG_FILE="$SCRIPT_DIR/rules/block-network-enabled.txt"
if [[ -f "$BLOCK_NETWORK_FLAG_FILE" ]]; then
    flag_content="$(< "$BLOCK_NETWORK_FLAG_FILE")"
    flag_content="${flag_content//[[:space:]]/}"
    if [[ "$flag_content" =~ ^[0-9]+$ ]] && (( 10#$flag_content != 0 )); then
        BLOCK_NETWORK_ENABLED=1
    fi
fi

if [[ -f "$BLOCKED_COMMANDS_FILE" ]]; then
    while IFS= read -r line || [[ -n "$line" ]]; do
        [[ -z "${line//[[:space:]]/}" || "$line" =~ ^[[:space:]]*# ]] && continue
        
        # Parse pattern:::signal:::message
        # First, extract pattern (before first :::)
        pattern="${line%%:::*}"
        
        # Check if line contains :::
        if [[ "$line" == *":::"* ]]; then
            # Line contains at least one :::
            rest="${line#*:::}"
            # Check if rest contains :::
            if [[ "$rest" == *":::"* ]]; then
                # Has both signal and message
                signal="${rest%%:::*}"
                message="${rest#*:::}"
            else
                # Only has signal, no message
                signal="$rest"
                message=""
            fi
        else
            # No ::: at all, only pattern
            signal=""
            message=""
        fi
        
        if [[ -z "$pattern" ]]; then
            continue
        fi
        
        # Default values
        if [[ -z "$signal" ]]; then
            signal="9"
        fi
        
        if [[ -z "$message" ]]; then
            message="This command is blocked by the user agent or the client."
        fi

        if echo "$2" | $PREFIX/bin/grep -Pq "$pattern"; then
	    echo "Input command match BLOCK pattern: $pattern" > /dev/tty
            echo "$message"
            kill -"$signal" $$
        fi
    done < "$BLOCKED_COMMANDS_FILE"
fi

if [[ -f "$MANUAL_APPROVE_FILE" ]]; then
    echo "Do you want to run $@ ? (y/N) " > /dev/tty
    read -r line < /dev/tty
#    echo "$line"
    if [[ "$line" != "y" && "$line" != "Y" ]]; then
        echo '0xC0000022' > /dev/fd/2
        kill -9 $$
    fi
fi

if [[ "$BLOCK_NETWORK_ENABLED" -eq 1 ]]; then
    RUN_PREFIX=("$SCRIPT_DIR/fuck-network.sh" bash)
else
    RUN_PREFIX=(bash)
fi

if [[ -z "$DSNATIVE2_EXEC_TIMEOUT" ]]; then
exec "${RUN_PREFIX[@]}" "$@"
else
timeout -k 5s "$DSNATIVE2_EXEC_TIMEOUT" "${RUN_PREFIX[@]}" "$@"
fi
