// @ts-nocheck

import { defineConfig } from "astro/config";
import wix from "@wix/astro";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  integrations: [wix(), react()],

  adapter: cloudflare({
    platformProxy: {
      enabled: false,
    },
  }),

  image: {
    domains: ["static.wixstatic.com"],
  },
  security: {
    checkOrigin: false,
  },
  server: {
    allowedHosts: [".wix-code.com"],
    host: true,
  },
  vite: {
    server: {
      cors: true,
    },
    resolve: {
      alias: {
        backend: path.resolve(__dirname, "src/backend"),
      },
    },
    optimizeDeps: {
      exclude: [
        "wix-data",
        "wix-web-module",
        "wix-app-instance-backend",
        "wix-auth",
        "wix-crm",
        "wix-crm-backend",
        "wix-http-functions",
        "wix-site-backend",
      ],
    },
    build: {
      rollupOptions: {
        external: [
          "wix-data",
          "wix-web-module",
          "wix-app-instance-backend",
          "wix-auth",
          "wix-crm",
          "wix-crm-backend",
          "wix-http-functions",
          "wix-site-backend",
        ],
      },
    },
  },
  devToolbar: { enabled: false },
  output: "server",
});
