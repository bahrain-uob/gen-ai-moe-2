import { SSTConfig } from 'sst';
import { FrontendStack } from './stacks/FrontendStack';
import { DBStack } from './stacks/DBStack';
import { ApiStack } from './stacks/ApiStack';
import { ImageBuilderForCodeCatalyst } from './stacks/devops/ImageBuilderForCodeCatalyst';
import { OIDCForGitHubCI } from './stacks/devops/OIDCForGitHubCI';
import { AuthStack } from './stacks/AuthStack';
import { GrammarToolStack } from './stacks/GrammarToolStack';
import { StorageStack } from './stacks/StorageStack';


export default {
  config(_input) {
    return {
      name: 'codecatalyst-sst-app',
      region: 'us-east-1',
      cdk:{
        customPermissionsBoundary: "arn:aws:iam::597088060025:policy/NCSC-Boundry",
        publicAccessBlockConfiguration: false,
      }
    };
  },
  stacks(app) {
    // Remove all resources when non-prod stages are removed
    if (app.stage !== 'prod') {
      app.setDefaultRemovalPolicy('destroy');
    }

    if (app.stage == 'devops-coca') {
      app.stack(ImageBuilderForCodeCatalyst);
    } else if (app.stage == 'devops-gh') {
      app.stack(OIDCForGitHubCI);
    } else {
      app
        .stack(DBStack)
        .stack(AuthStack)
        .stack(GrammarToolStack)
        .stack(StorageStack)
        .stack(ApiStack)
        .stack(FrontendStack)
        //.stack(StorageStack)
    }
  },
} satisfies SSTConfig;
