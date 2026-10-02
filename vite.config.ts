import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  resolve: { alias: { react: "preact/compat", "react-dom": "preact/compat" } },
  server: { proxy: { "/api": "http://localhost:8787" } },
  test: {
    environment: "node",
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules", "dist"],
    // Process TanStack Query through Vite so the react -> preact/compat alias applies in tests
    // (npm also installs `react` as a peer dependency; without this the tests would load it).
    server: { deps: { inline: ["@tanstack/react-query"] } },
  },
});
