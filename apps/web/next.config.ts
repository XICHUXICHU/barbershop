/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@barber/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dkxlyeslu/**",
      },
    ],
  },
};

export default nextConfig;
