import * as cdk from '@aws-cdk/core';
import * as eb from '@aws-cdk/aws-elasticbeanstalk';
import * as Codebuild from '@aws-cdk/aws-codebuild';
import * as cfg from './config';

export class AwsCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // get platform to be created
    const platform = this.node.tryGetContext('platform');

    // beanstalk project setup
    const ebApp = new eb.CfnApplication(this, `${cfg.APP_NAME}-app`, {
      applicationName: cfg.APP_NAME,
    });

    // role for ec2 instance
    const options: eb.CfnEnvironment.OptionSettingProperty[] = [
      {
        namespace: 'aws:autoscaling:launchconfiguration',
        optionName: 'IamInstanceProfile',
        value: 'aws-elasticbeanstalk-ec2-role',
      },
    ];

    const ebEnv = new eb.CfnEnvironment(this, 'develop-env', {
      // default environmentName is `develop`
      environmentName: cfg.APP_STAGE_NAME,
      applicationName: ebApp.applicationName,
      platformArn: platform,
      optionSettings: options,
      solutionStackName:
        '64bit Amazon Linux 2 v0.1.0 running Node.js 10 (BETA)',
    });

    ebEnv.addDependsOn(ebApp);

    // codebuild project setup
    const webhooks: Codebuild.FilterGroup[] = [
      Codebuild.FilterGroup.inEventOf(
        Codebuild.EventAction.PUSH,
        Codebuild.EventAction.PULL_REQUEST_MERGED
      ).andHeadRefIs(cfg.BUILD_BRANCH),
    ];

    const repo = Codebuild.Source.gitHub({
      owner: cfg.REPO_OWNER,
      repo: cfg.REPO_NAME,
      webhook: true,
      webhookFilters: webhooks,
      reportBuildStatus: true,
    });

    const project = new Codebuild.Project(this, `${cfg.APP_NAME}-build`, {
      buildSpec: Codebuild.BuildSpec.fromSourceFilename('buildspec.yml'),
      projectName: `${cfg.APP_NAME}-build`,
      environment: {
        buildImage: Codebuild.LinuxBuildImage.STANDARD_3_0,
        computeType: Codebuild.ComputeType.SMALL,
        environmentVariables: {
          EB_STAGE: {
            value: cfg.APP_STAGE_NAME,
          },
          // you can add more env variables here as per your requirement
        },
      },
      source: repo,
      timeout: cdk.Duration.minutes(20),
    });

    // // iam policy to push your build to S3
    // project.addToRolePolicy(
    //   new IAM.PolicyStatement({
    //     effect: IAM.Effect.ALLOW,
    //     resources: [bucket.bucketArn, `${bucket.bucketArn}/*`],
    //     actions: [
    //       's3:GetBucket*',
    //       's3:List*',
    //       's3:GetObject*',
    //       's3:DeleteObject',
    //       's3:PutObject',
    //     ],
    //   })
    // );
    // // iam policy to invalidate cloudfront distribution's cache
    // project.addToRolePolicy(
    //   new IAM.PolicyStatement({
    //     effect: IAM.Effect.ALLOW,
    //     resources: ['*'],
    //     actions: [
    //       'cloudfront:CreateInvalidation',
    //       'cloudfront:GetDistribution*',
    //       'cloudfront:GetInvalidation',
    //       'cloudfront:ListInvalidations',
    //       'cloudfront:ListDistributions',
    //     ],
    //   })
    // );
  }
}
