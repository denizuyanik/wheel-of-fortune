# Getting Started

This repository contains the Wheel of Fortune MVP: a Wix Dashboard configuration page, a Custom Element site widget for Wix Studio and Wix Editor, and a server-side spin API. See [the architecture and data model](docs/architecture.md) for trust boundaries, collection definitions, and API contracts.

This app was created using the [Wix CLI](https://dev.wix.com/docs/wix-cli/guides/about-the-wix-cli). Develop and release your app locally using the steps below.

## Project structure

```
├── src/
│   ├── dashboard/
│   │   └── pages/
│   ├── site/
│   │   └── widgets/
│   ├── extensions/
│   │   └── site/widgets/
│   ├── backend/
│   └── extensions.ts
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── wix.config.json
```

Learn more about the [project structure](https://dev.wix.com/docs/wix-cli/guides/get-started/project-structure).

## Development

Start a local development server with `npm run dev` and add new [extensions](https://dev.wix.com/docs/wix-cli/guides/extensions/about-extensions) with `npm run generate`. Learn more about the [development workflow](https://dev.wix.com/docs/wix-cli/guides/development/development-overview).

During `wix dev`, the app uses an in-memory development store if the release-managed App Data collections are not installed yet. It resets when the development server restarts. Production builds never use this fallback.

## Wix Forms setup

The widget submits participant details to Wix Forms before a spin is recorded. Create a Wix Form whose field targets are `first_name`, `last_name`, `phone`, `email`, `contact_consent`, and `marketing_consent`, then paste its form ID into **Wheel of Fortune → Lead form & background**. The first five fields are required by the app; marketing consent remains optional and is stored separately.

To notify the business, add a Wix Automation triggered by a submission to this form and choose the business notification email as the action. The app stores only the returned submission ID with the spin; contact details remain in Wix Forms.

## Build and release

Use `npm run build`, `npm run preview`, and `npm run release` to build, preview, and publish your app. Learn more about [building and deploying](https://dev.wix.com/docs/wix-cli/guides/development/build-and-deploy-a-project).

Pull the Wix environment once with `npm run env` before a local build. CI must provide `WIX_CLIENT_ID`. Run `npm run typecheck` alongside `npm run build` for full TypeScript validation.

Once released, [submit your app for review](https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/submit-your-first-app-version) to publish it on the [Wix App Market](https://www.wix.com/app-market), or [share an install link](https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/share-an-app-install-link).

## Enhance your dev experience with AI tools

[Wix Skills](https://dev.wix.com/docs/wix-cli/guides/development/about-wix-skills) help AI tools like Claude and Cursor work with the Wix CLI by providing the instructions and context needed to develop, deploy, and manage CLI projects.

The [Wix MCP](https://dev.wix.com/docs/sdk/articles/use-the-wix-mcp/about-the-wix-mcp) server allows you to work with Wix tools and services in your AI client. It enables your client to search the Wix documentation, write code for the Wix platform, and make API calls on Wix sites.

## Continue in the workspace

After working locally, you can also develop and iterate on this app in the [app workspace](https://dev.wix.com/docs/api-preview/building-apps-with-ai/workspace/about-the-app-workspace). Use the AI agent to make changes or edit the code directly in the [code tab](https://dev.wix.com/docs/api-preview/building-apps-with-ai/workspace/about-the-code-tab).


## See also

- [About Building Apps with AI](https://dev.wix.com/docs/api-preview/building-apps-with-ai/about-building-apps-with-ai)
- [Best Practices for AI Prompts for Building Apps](https://dev.wix.com/docs/api-preview/building-apps-with-ai/get-started/best-practices-for-ai-prompts)
- [Join our App Developer Community on Discord](https://discord.gg/Qcqct4kumG)
