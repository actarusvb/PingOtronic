#!/bin/bash

cd /home/ingestor/ingestor

now=$(date +"%Y%m%d")

tar cf Ingestor-Dev-$now.tar \
conf.json \
db.js \
hostNames.txt \
hostView.js \
ingestor.js \
NOTES.txt \
lostDetect.js \
package.json \
README.md \
LICENSE \
save.sh \
startPing.sh \
views \
routes \
public 

gzip Ingestor-Dev-$now.tar
