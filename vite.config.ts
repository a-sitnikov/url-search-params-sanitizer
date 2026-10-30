import { defineConfig } from "vite";
import dts from "unplugin-dts/vite";

export default defineConfig({
  plugins: [
    dts({
      bundleTypes: true,
      compilerOptions: {
        declarationMap: false,
        sourceMap: false,
      },
    }),
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    minify: false,
  },
});
