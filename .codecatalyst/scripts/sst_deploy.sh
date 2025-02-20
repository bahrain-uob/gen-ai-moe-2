#!/usr/bin/env bash
echo "Deploying project"

source ~/.bashrc
nohup dockerd &
docker version
npm install
npm audit fix
npx cdk bootstrap aws://597088060025/us-east-1 --force \
  --cloudformation-execution-policies arn:aws:iam::597088060025:policy/Cdk_Least \
  --custom-permissions-boundary arn:aws:iam::597088060025:policy/NCSC_Boundry \
  --no-public-access-block-configuration
npx sst deploy --stage iga