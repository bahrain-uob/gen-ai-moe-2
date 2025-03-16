#!/usr/bin/env bash
echo "Deploying project"

if [ -f ../.env ]; then
  echo ".env file found at ../.env"
  source ../.env
elif [ -f $HOME/.env ]; then
  echo ".env file found at $HOME/.env"
else
  echo ".env file not found :("
  echo "Current working directory: $(pwd)"
fi

source ~/.bashrc
nohup dockerd &
docker version
npm install
npm audit fix
echo aws://$AWS_ACCOUNT_ID/us-east-1
npx cdk bootstrap aws://$AWS_ACCOUNT_ID/us-east-1 --force \
  --cloudformation-execution-policies arn:aws:iam::$AWS_ACCOUNT_ID:policy/Cdk_Least \
  --no-public-access-block-configuration
npx sst deploy --stage iga
