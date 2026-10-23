// @ts-check
import { defineConfig } from "astro/config";

// Sitio 100% estático: `npm run build` genera /dist, que se sube tal cual a GoDaddy (public_html).
export default defineConfig({
  site: process.env.SITE_URL ?? "https://andeanoriginlabs.com",
  output: "static",
  trailingSlash: "ignore",
  build: {
    format: "file",
    inlineStylesheets: "auto",
  },
  compressHTML: true,
  vite: {
    // three.js (WebGLRenderer) pesa ~130 KB gzip y ya se carga aparte, con import dinámico.
    build: { chunkSizeWarningLimit: 600 },
  },
});
