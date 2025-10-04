import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class HealthController {
  @ApiOperation({ summary: '헬스체크', description: '서버 상태를 확인합니다.' })
  @ApiResponse({ status: 200, description: '서버 정상' })
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version,
    };
  }

  // 전체 api 서버에 대한 health check로, v1 태그 없음
  @Get('api/health')
  getApiHealth() {
    return this.getHealth();
  }
}
