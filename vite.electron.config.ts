import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src")
    }
  },
  build: {
    ssr: true,
    target: "node22",
    outDir: "dist/electron",
    emptyOutDir: true,
    lib: {
      entry: {
        main: path.resolve(import.meta.dirname, "src/electron/main.ts"),
        preload: path.resolve(import.meta.dirname, "src/electron/preload.ts")
      },
      formats: ["cjs"]
    },
    rollupOptions: {
      external: ["electron", "playwright", "better-sqlite3"],
      output: {
        entryFileNames: "[name].cjs"
      }
    }
  }
});
