import { config } from 'dotenv';
config();
import * as cdk from '@aws-cdk/core';
import * as Codebuild from '@aws-cdk/aws-codebuild';
import { expect as expectCDK, haveResourceLike } from '@aws-cdk/assert';
import { AwsCdkStack } from '../lib/aws-cdk-stack';
import { envVars } from '../lib/config';

test('creates an Elastic Beanstalk app', () => {
  const stack = createStack();
  expectCDK(stack).to(
    haveResourceLike('AWS::ElasticBeanstalk::Application', {
      ApplicationName: 'node-eb',
    })
  );
});

test('creates an Elastic Beanstalk environment', () => {
  const stack = createStack();
  expectCDK(stack).to(
    haveResourceLike('AWS::ElasticBeanstalk::Environment', {
      ApplicationName: 'node-eb',
      EnvironmentName: 'main',
    })
  );
});

test('creates a Codebuild project', () => {
  const stack = createStack();
  expectCDK(stack).to(
    haveResourceLike('AWS::CodeBuild::Project', {
      Artifacts: {
        Type: 'NO_ARTIFACTS',
      },
      Environment: {
        ComputeType: Codebuild.ComputeType.SMALL,
        EnvironmentVariables: [
          {
            Name: 'EB_STAGE',
            Type: 'PLAINTEXT',
            Value: envVars.APP_STAGE_NAME,
          },
        ],
        PrivilegedMode: false,
      },
      Name: 'node-eb-build',
      TimeoutInMinutes: 20,
      Triggers: {
        FilterGroups: [
          [
            {
              Pattern: 'PUSH, PULL_REQUEST_MERGED',
              Type: 'EVENT',
            },
            {
              Pattern: envVars.BUILD_BRANCH,
              Type: 'HEAD_REF',
            },
          ],
        ],
        Webhook: true,
      },
    })
  );
});

function createStack() {
  const stackName = 'Node-EB-Deploy';
  const app = new cdk.App();
  return new AwsCdkStack(app, stackName);
}
