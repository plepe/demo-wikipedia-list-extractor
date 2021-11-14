#!/bin/sh
git pull
docker pull node:14
docker build -t skunk/demo-wikipedia-list-extractor .
docker container rm -f demo-wikipedia-list-extractor
docker run --name demo-wikipedia-list-extractor --restart=always -p 127.0.0.1:43211:8080 -d skunk/demo-wikipedia-list-extractor
