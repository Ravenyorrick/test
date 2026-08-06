import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  build: {
    outDir: "dist/electron",
    emptyOutDir: true,
    lib: {
      entry: {
        main: path.resolve(__dirname, "src/electron/main.ts"),
        preload: path.resolve(__dirname, "src/electron/preload.ts")
      },
      formats: ["es"]
    },
    rollupOptions: {
      external: ["electron", "playwright", "better-sqlite3"],
      output: {
        entryFileNames: "[name].js"
      }
    }
  }
});
