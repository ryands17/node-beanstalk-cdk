#!/usr/bin/env node
import { config } from 'dotenv';
config();
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsCdkStack } from '../lib/aws-cdk-stack';
import { REGION } from '../lib/config';

const app = new cdk.App();
new AwsCdkStack(app, 'Node-EB-Deploy', {
  env: {
    region: REGION,
  },
});
