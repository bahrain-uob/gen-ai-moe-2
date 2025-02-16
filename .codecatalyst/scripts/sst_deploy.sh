#!/usr/bin/env bash
echo "Deploying project"

source ~/.bashrc
nohup dockerd &
docker version
npm install
npm install react-dropzone
npm install @heroicons/react
npm install chart.js
npx sst deploy --stage iga