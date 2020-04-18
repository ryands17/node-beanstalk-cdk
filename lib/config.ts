export const REGION = process.env.REGION;
export const APP_NAME = process.env.APP_NAME;
export const REPO_OWNER = process.env.REPO_OWNER;
export const REPO_NAME = process.env.REPO_NAME;
export const APP_STAGE_NAME = process.env.APP_STAGE_NAME || 'develop';

// change this to the branch of your choice
export const BUILD_BRANCH = '^refs/heads/master$';
