import { config } from 'dotenv';
config();
import * as cdk from '@aws-cdk/core';
import { SynthUtils } from '@aws-cdk/assert';
import { AwsCdkStack } from '../lib/aws-cdk-stack';

const stackName = 'Node-EB-Deploy';

test('snapshot works correctly', () => {
  const app = new cdk.App();
  const stack = new AwsCdkStack(app, stackName);
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});
