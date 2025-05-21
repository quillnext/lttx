/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    domains: ["picsum.photos","cloud.appwrite.io","firebasestorage.googleapis.com"],

  }, 
};

export default nextConfig;
