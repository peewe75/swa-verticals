/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@swa/db", "@swa/lib-llm", "@swa/lib-wa"],
};

export default nextConfig;
