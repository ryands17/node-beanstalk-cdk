# Beanstalk Deploy Codebuild

This is an [aws-cdk](https://aws.amazon.com/cdk/) project where you can deploy your Node application on Elastic Beanstalk via Codebuild.

I have created a blog post on understanding how this works [here](https://dev.to/ryands17/deploying-a-node-app-to-beanstalk-using-aws-cdk-typescript-3b8d).

**_Note_**: This configuration is for GitHub only. For Bitbucket, you can edit the source accordingly.

**Prerequisites**

- Setup your access and secret keys via the [aws-cli](https://aws.amazon.com/cli/) and with the profile name of your choice (the default profile is named `default`). The credentials generated should have access to creation of all resources mentioned else it won't work.

**Steps**

1. Rename the `.example.env` file to `.env` and replace all the values with your predefined values for your stack.

**_Note_**: All the variables are mandatory! Without that, the stack wouldn't work.

2. Run `npm install`

3. Run `npm run deploy -- --profile profileName` to deploy the stack to your specified region. You can omit the profile parameter if the profile name is `default`.

4. You can start the build from the console in `Codebuild` and your Node application works the Beanstalk provided URL!

The `cdk.json` file tells the CDK Toolkit how to execute your app.

- In the `cdk.json` the platform parameter is passed to use the environment for Node 10. You can replace that with any environent of your choice.

You can get the list of platforms using `aws elasticbeanstalk list-platform-versions`.

## Commands

- `npm run build` compile typescript to js
- `npm run deploy` deploy this stack to your AWS account/region specified in the `.env`
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
