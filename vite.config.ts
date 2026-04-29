import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

export default defineConfig({
  root: "src/hhs_lakehouse_architecture/ui",
  plugins: [
    TanStackRouterVite({
      routesDirectory: path.resolve(__dirname, "src/hhs_lakehouse_architecture/ui/routes"),
      generatedRouteTree: path.resolve(__dirname, "src/hhs_lakehouse_architecture/ui/types/routeTree.gen.ts"),
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src/hhs_lakehouse_architecture/ui"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
});
