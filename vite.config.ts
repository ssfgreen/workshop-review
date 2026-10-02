import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  resolve: { alias: { react: "preact/compat", "react-dom": "preact/compat" } },
  server: { proxy: { "/api": "http://localhost:8787" } },
  test: { environment: "node", include: ["**/*.test.ts"], exclude: ["node_modules", "dist"] },
});
