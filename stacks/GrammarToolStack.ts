// import { StackContext, Service } from 'sst/constructs';
// import { Fn } from 'aws-cdk-lib';

// export function GrammarToolStack({ stack }: StackContext) {
//   const grammarToolName = 'grammarToolDNS';
//   let grammarToolDNS: string;

//   if (stack.stage === 'prod') {
//     // Create the GrammerCheckerTool Service
//     const GrammerCheckerTool = new Service(stack, 'GrammerCheckerTool', {
//       path: 'packages/functions/src/docker-languagetool',
//       port: 8010,
//       dev: {
//         deploy: true, //Uncomment to deploy the service while in dev mode
//       },
//       cdk: {
//         cloudfrontDistribution: false,
//         applicationLoadBalancerTargetGroup: {
//           healthCheck: {
//             path: '/v2/languages',
//           },
//         },
//       },
//     });

//     grammarToolDNS =
//       GrammerCheckerTool.cdk?.applicationLoadBalancer?.loadBalancerDnsName ??
//       'undefined DNS';

//     // export the DNS name of the GrammerCheckerTool to be used by other stacks
//     stack.addOutputs({
//       [grammarToolName]: {
//         value: grammarToolDNS,
//         exportName: grammarToolName,
//       },
//     });
//   } else {
//     // import the DNS name of the GrammerCheckerTool to be used by other stacks
//     grammarToolDNS = Fn.importValue(grammarToolName);
//     stack.addOutputs({
//       GrammarTool: grammarToolDNS,
//     });
//   }

//   return { grammarToolDNS };
// }

import { StackContext } from 'sst/constructs';
import { Fn } from 'aws-cdk-lib';

export function GrammarToolStack({ stack }: StackContext) {
  const grammarToolName = undefined;
  let grammarToolDNS: string;

  if (stack.stage === 'prod') {
    // Use the external LanguageTool API URL in the production environment
    grammarToolDNS = 'https://api.languagetool.org/v2/check'; // Public API endpoint

    // Export the API URL for use by other stacks
    stack.addOutputs({
      [grammarToolName]: {
        value: grammarToolDNS,
        exportName: grammarToolName,
      },
    });
  } else {
    // In non-production environments, import the API URL
    grammarToolDNS = grammarToolName;
    stack.addOutputs({
      GrammarTool: grammarToolDNS,
    });
  }

  return { grammarToolDNS };
}
