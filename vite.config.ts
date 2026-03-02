import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve(__dirname, "globestream"),
  publicDir: resolve(__dirname, "globestream/public"),
  plugins: [react()],
  base:
    process.env.NODE_ENV === "development"
      ? process.env.DEV_SERVER_BASE_PATH
      : undefined,
  server: {
    port: Number(process.env.DEV_SERVER_PORT ?? 8080),
    host: process.env.DEV_SERVER_HOST,
    allowedHosts:
      process.env.DEV_SERVER_DOMAIN != null
        ? [process.env.DEV_SERVER_DOMAIN]
        : undefined,
    proxy: {
      "/api": "http://localhost:3001",
      "/health": "http://localhost:3001",
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "globestream/src"),
    },
  },
  build: {
    outDir: resolve(__dirname, "globestream", "dist"),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          motion: ["framer-motion"],
          icons: ["lucide-react"],
        },
      },
    },
  },
});
