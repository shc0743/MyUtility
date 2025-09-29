#!/usr/bin/env bash
ancc() {
    if [ $# -ne 1 ]; then
        echo "Usage: ancc file.java"
        return 1
    fi
    
    local java_file="$1"
    local class_name=$(basename "$java_file" .java)
    
    if [ ! -f "$java_file" ]; then
        echo "Build FAILED: No input file"
        return 1
    fi
    
    if ! javac -source 1.8 -target 1.8 "$java_file"; then
        echo "Build FAILED: Java error"
        return 1
    fi
    
    if ! d8 --release --lib "$android_jar" --output . "${class_name}.class"; then
        echo "Build FAILED"
        return 1
    fi
    
    if [ -f "classes.dex" ]; then
        chmod 444 "classes.dex"
        echo "Built"
        mv -f classes.dex $class_name.dex
    else
        echo "Build FAILED: classes.dex not found"
        return 1
    fi
    
    rm -f "${class_name}.class"
}
anrun() {
    /system/bin/app_process -Djava.class.path="$1" "$(pwd)" "$2"
}