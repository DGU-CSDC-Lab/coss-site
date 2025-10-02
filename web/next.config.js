/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    // 빌드 시 prettier 에러를 무시하고 진행
    ignoreDuringBuilds: false,
  },
  images: {
    domains: [
      'localhost', 
      'picsum.photos',
      '127.0.0.1',
      'server',
      // 추가 가능한 도메인들
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'server',
        port: '3001',
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'http://server:3001/api/v1/:path*'
          : 'http://localhost:3001/api/v1/:path*',
      },
      // 기존 api 경로도 v1으로 리다이렉트
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'http://server:3001/api/v1/:path*'
          : 'http://localhost:3001/api/v1/:path*',
      },
    ]
  },
}

module.exports = nextConfig
