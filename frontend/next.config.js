/** @type {import('next').NextModel} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api/:path*` : 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
