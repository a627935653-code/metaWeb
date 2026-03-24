import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

import tailwindcss from "@tailwindcss/vite";

import path from "path";
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        src: path.resolve(__dirname, "./src"),
      },
    },
    server: {
      allowedHosts: true,
      proxy: {
      "/api": {
        target: "http://127.0.0.1:8789", // 这里是你的后端地址
        changeOrigin: true, // 必须设置为 true，以绕过 CORS
        rewrite: (path) => path.replace(/^\/api/, ""), // 将请求转发到后端的真实路径
      },
    },
    },
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL),
    },
  };
});
