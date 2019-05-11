#!/bin/sh

cd api
npm install
npm start &
sleep 5
npm test
