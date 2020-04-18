import * as cdk from '@aws-cdk/core';
import * as EB from '@aws-cdk/aws-elasticbeanstalk';
import * as IAM from '@aws-cdk/aws-iam';
import * as Codebuild from '@aws-cdk/aws-codebuild';
import * as cfg from './config';

export class AwsCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // get platform to be created
    const platform = this.node.tryGetContext('platform');

    // beanstalk project setup
    const ebApp = new EB.CfnApplication(this, `${cfg.APP_NAME}-app`, {
      applicationName: cfg.APP_NAME,
    });

    // role for ec2 instance
    const options: EB.CfnEnvironment.OptionSettingProperty[] = [
      {
        namespace: 'aws:autoscaling:launchconfiguration',
        optionName: 'IamInstanceProfile',
        value: 'aws-elasticbeanstalk-ec2-role',
      },
    ];

    const ebEnv = new EB.CfnEnvironment(this, `${cfg.APP_NAME}-env`, {
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

    const project = new Codebuild.Project(this, cfg.APP_NAME, {
      buildSpec: Codebuild.BuildSpec.fromSourceFilename('buildspec.yml'),
      projectName: `${cfg.APP_NAME}-build`,
      environment: {
        buildImage: Codebuild.LinuxBuildImage.AMAZON_LINUX_2_3,
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

    project.role.addManagedPolicy(
      IAM.ManagedPolicy.fromAwsManagedPolicyName(
        'AWSElasticBeanstalkFullAccess'
      )
    );
  }
}
