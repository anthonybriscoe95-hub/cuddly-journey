import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

const standalone = process.env.STANDALONE === "1";

export default defineConfig({
  base: "./",
  plugins: [react(), ...(standalone ? [viteSingleFile()] : [])],
  build: standalone
    ? {
        outDir: "dist-standalone",
        cssCodeSplit: false,
        assetsInlineLimit: 100_000_000,
        rollupOptions: { output: { inlineDynamicImports: true } },
      }
    : {},
});
