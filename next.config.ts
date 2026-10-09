import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Opt out native server packages from Turbopack bundling
  serverExternalPackages: [
    "whatsapp-web.js",
    "puppeteer",
    "puppeteer-core",
    "mysql2",
    "qrcode-terminal",
  ],

  // Top-level Turbopack configuration for project root resolution
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
