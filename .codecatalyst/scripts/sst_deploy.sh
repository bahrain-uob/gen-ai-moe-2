#!/usr/bin/env bash
echo "Deploying project"

if [ -f ./.env ]; then
  echo ".env file found in the current directory"
  source ./.env
  #source ~/.bashrc
  nohup dockerd &
  docker version
  npm install
  npm audit fix
  echo aws://$AWS_ACCOUNT_ID/us-east-1
  npx cdk bootstrap aws://$AWS_ACCOUNT_ID/us-east-1 --force \
    --cloudformation-execution-policies arn:aws:iam::$AWS_ACCOUNT_ID:policy/Cdk_Least \
    --no-public-access-block-configuration
  npx sst deploy --stage prod
else
  echo ".env file not found in the current directory"
  echo "Current directory: $(pwd)"
  echo "Please add .env file"
  echo "Canceling Deployment"
  exit 1
fi
