export const envVars = {
  REGION: process.env.REGION || 'us-east-1',
  APP_NAME: process.env.APP_NAME,
  REPO_OWNER: process.env.REPO_OWNER,
  REPO_NAME: process.env.REPO_NAME,
  APP_STAGE_NAME: process.env.APP_STAGE_NAME || 'develop',
  // change this to the branch of your choice
  BUILD_BRANCH: process.env.BUILD_BRANCH || '^refs/heads/main$',
};

export function validateEnvVariables() {
  for (let variable in envVars) {
    if (!envVars[variable as keyof typeof envVars])
      throw Error(`Environment variable ${variable} is not defined!`);
  }
}
