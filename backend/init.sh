#! /bin/sh

cd /app/express
rm -rf node_modules
rm -rf package-lock.json
npm install
npm start