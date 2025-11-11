import { NestFactory } from '@nestjs/core';
import { LogLevel, ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '@/app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import otelSDK from '@/logger/tracing';

// 로그 레벨 설정 함수
const getLogLevels = (): LogLevel[] => {
  const level = process.env.LOG_LEVEL || 'log';

  switch (level) {
    case 'debug':
      return ['error', 'warn', 'log', 'debug'];
    case 'info':
      return ['error', 'warn', 'log'];
    case 'warn':
      return ['error', 'warn'];
    case 'error':
      return ['error'];
    default:
      return ['error', 'warn', 'log'];
  }
};

// 환경변수 로드
async function bootstrap() {
  await otelSDK.start();

  // Nest App 인스턴스 생성
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // 초기 로그도 버퍼링해서 Winston이 처리하게
    logger: getLogLevels(),
  });

  const nestLogger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(nestLogger);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      nestLogger.log(`[HTTP] ${req.method} ${req.url} ${res.statusCode} +${duration}ms`);
    });

    next();
  });

  // CORS - 환경변수 기반 설정
  const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin =>
    origin.trim(),
  );

  app.enableCors({
    origin: [...allowedOrigins],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger 설정
  const swaggerServerUrl = process.env.SWAGGER_SERVER_URL;

  const config = new DocumentBuilder()
    .setTitle('COSS DGU Backend API Swagger')
    .setDescription(
      '동국대학교 COSS 지능IoT학과 홈페이지 백엔드 API 문서입니다. \n\n',
    )
    .setVersion('1.0.0') // 서버 버전 태그
    .addServer(
      swaggerServerUrl,
      process.env.NODE_ENV === 'production' ? 'Production' : 'Development',
    ) // 서버 URL 설정
    // Bearer Auth 설정
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Authorization: Bearer <JWT>',
      },
      'bearerAuth', // 이 설정의 이름 (Security 이름)
    )
    .build();

  // Swagger 모듈 설정 (자동 스키마 생성 활성화)
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });
  SwaggerModule.setup('api-docs', app, document, {
    // api-docs 경로로 설정
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // 서버 시작
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
  nestLogger.log(`Server running on port ${process.env.PORT || 3000}`);
  // console.log(`Application is running on: ${await app.getUrl()}`);
  // console.log(`Swagger docs available at: ${await app.getUrl()}/api-docs`);
  // console.log(`CORS origins: ${JSON.stringify([...allowedOrigins])}`);
}

bootstrap();
