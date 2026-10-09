import type { NextConfig } from "next";
import path from "path";
// @ts-ignore
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    skipWaiting: true,
  },
});

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

export default withPWA(nextConfig);
