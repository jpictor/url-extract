#!/bin/bash
docker stop url-extract
docker rm url-extract
docker run -d -p 127.0.0.1:2223:2223 --name=url-extract url-extract:latest
