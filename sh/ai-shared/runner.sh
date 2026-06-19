#!/usr/bin/env bash

BLOCKED_COMMANDS_FILE="$HOME/ai-shared/blocked_commands.txt"

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
            echo "$message"
            kill -"$signal" $$
        fi
    done < "$BLOCKED_COMMANDS_FILE"
fi

exec bash "$@"
