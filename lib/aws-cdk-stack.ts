import * as cdk from '@aws-cdk/core';
import * as EB from '@aws-cdk/aws-elasticbeanstalk';
import * as IAM from '@aws-cdk/aws-iam';
import * as Codebuild from '@aws-cdk/aws-codebuild';
import { envVars } from './config';

export class AwsCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // get platform to be created
    const platform = this.node.tryGetContext('platform');

    // beanstalk project setup
    const ebApp = new EB.CfnApplication(this, `${envVars.APP_NAME}-app`, {
      applicationName: envVars.APP_NAME,
    });

    // role for ec2 instance
    const options: EB.CfnEnvironment.OptionSettingProperty[] = [
      {
        namespace: 'aws:autoscaling:launchconfiguration',
        optionName: 'IamInstanceProfile',
        value: 'aws-elasticbeanstalk-ec2-role',
      },
    ];

    const ebEnv = new EB.CfnEnvironment(this, `${envVars.APP_NAME}-env`, {
      // default environmentName is `develop`
      environmentName: envVars.APP_STAGE_NAME,
      applicationName: ebApp.applicationName,
      platformArn: platform,
      optionSettings: options,
    });

    ebEnv.addDependsOn(ebApp);

    // codebuild project setup
    const webhooks: Codebuild.FilterGroup[] = [
      Codebuild.FilterGroup.inEventOf(
        Codebuild.EventAction.PUSH,
        Codebuild.EventAction.PULL_REQUEST_MERGED
      ).andHeadRefIs(envVars.BUILD_BRANCH),
    ];

    const repo = Codebuild.Source.gitHub({
      owner: envVars.REPO_OWNER,
      repo: envVars.REPO_NAME,
      webhook: true,
      webhookFilters: webhooks,
      reportBuildStatus: true,
    });

    const project = new Codebuild.Project(this, envVars.APP_NAME, {
      buildSpec: Codebuild.BuildSpec.fromSourceFilename('buildspec.yml'),
      projectName: `${envVars.APP_NAME}-build`,
      environment: {
        buildImage: Codebuild.LinuxBuildImage.AMAZON_LINUX_2_3,
        computeType: Codebuild.ComputeType.SMALL,
        environmentVariables: {
          EB_STAGE: {
            value: envVars.APP_STAGE_NAME,
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
