/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  eslint: {
    // 빌드 시 prettier 에러를 무시하고 진행
    ignoreDuringBuilds: false,
  },
  images: {
    unoptimized: true,
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
  // CDN 배포에서는 rewrites 사용 불가 (제거)
}

module.exports = nextConfig
