#!/usr/bin/env bash
echo "Deploying project"

if [ -f ../.env ]; then
  source ../.env
fi

source ~/.bashrc
nohup dockerd &
docker version
npm install
npm audit fix
npx cdk bootstrap aws://$AWS_ACCOUNT_ID/us-east-1 --force \
  --cloudformation-execution-policies arn:aws:iam::$AWS_ACCOUNT_ID:policy/Cdk_Least \
  --no-public-access-block-configuration
npx sst deploy --stage iga