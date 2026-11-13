import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos do casal guardadas no Supabase Storage (bucket público wedding-media)
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
};

export default nextConfig;
