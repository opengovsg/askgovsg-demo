#!/bin/bash

rm -rf dist/
cp -rf src/server/ dist/
parcel build src/client/client.pug --dist-dir dist/public/