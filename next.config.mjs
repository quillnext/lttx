/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
     remotePatterns: [
    {
      protocol: 'https',
      hostname: 'picsum.photos',
      pathname: '/**',
    },
  ],
   remotePatterns: [
    {
      protocol: 'https',
      hostname: 'cloud.appwrite.io',
      pathname: '/**',
    },
  ],
   remotePatterns: [
    {
      protocol: 'https',
      hostname: 'firebasestorage.googleapis.com',
      pathname: '/**',
    },
  ],
   

  }, 
};

export default nextConfig;
