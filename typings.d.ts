declare namespace NodeJS {
  export interface ProcessEnv {
    REGION?: string;
    APP_NAME: string;
    REPO_OWNER: string;
    REPO_NAME: string;
    APP_STAGE_NAME?: string;
    BUILD_BRANCH?: string;
  }
}
