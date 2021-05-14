#!/bin/sh
action=$1
shift
core=translate-json-core
case $action in
    join)
        echo '{'
        while [ $# -gt 0 ]
        do
            printf '"%s":' "$1"
            cat "$1"
            [ $# -gt 1 ] && echo ,
            shift
        done
        echo '}'
        ;;
    find)
        $core -l "$@"
        ;;
    find-ja*|find-jp)
        $core -l -m '[\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF]' "$@"
        ;;
    count)
        sed 's/^.*\t//' | sort | uniq -c |sort -n
        ;;
    patch)
        $core -p "$@"
        ;;
    split)
        $core -c "$@"
        ;;
esac
