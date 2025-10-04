/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: false, // 빌드 및 라우팅 전반에서 /가 자동으로 붙는 것 맞기
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
}

module.exports = nextConfig
