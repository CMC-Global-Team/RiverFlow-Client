import { config as loadEnv } from "dotenv";
import path from "path";

const prodEnvPath = path.resolve(process.cwd(), ".env.production");
loadEnv({
  path: prodEnvPath,
  override: process.env.NODE_ENV !== "production",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Relax COOP/COEP for OAuth popups and postMessage during development
          { key: "Cross-Origin-Opener-Policy", value: "unsafe-none" },
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
        ],
      },
    ];
  },
};

export default nextConfig
