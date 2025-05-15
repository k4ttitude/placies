import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/app.ts", "src/db/seed.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ["cjs"],
});
