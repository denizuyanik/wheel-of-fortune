/// <reference types="astro/client" />
/// <reference types="@wix/sdk-types/client" />
/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly BASE_API_URL?: string;
  readonly DEV?: boolean;
  readonly PROD?: boolean;
  readonly SSR?: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
