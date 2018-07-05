#!/bin/sh
convert $1 txt:- | tail -n +2 | head -n -1 | ./convert.js
