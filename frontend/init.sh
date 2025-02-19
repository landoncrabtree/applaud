#!/bin/sh

cd /app/nextjs
rm -rf node_modules
rm -rf package-lock.json
npm install
npm run dev