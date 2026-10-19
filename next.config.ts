import type { NextConfig } from "next";

// Nginx is managed externally:
//   location /sheet2web/ { proxy_pass http://localhost:2507/; }
// It removes /sheet2web/ before proxying. Do NOT enable basePath here.
const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Keep Next.js JavaScript and CSS under the public /sheet2web/ URL.
  assetPrefix: isProduction ? "/sheet2web" : undefined,
  // next/image optimization endpoint also needs to be publicly prefixed.
  images: {
    path: isProduction ? "/sheet2web/_next/image" : "/_next/image",
  },
};

export default nextConfig;
