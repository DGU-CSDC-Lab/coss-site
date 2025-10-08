import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS - 환경변수 기반 설정
  const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());

  app.enableCors({
    origin: [
      ...allowedOrigins
    ],
    credentials: true,
  });

  const swaggerServerUrl = process.env.SWAGGER_SERVER_URL;
  
  const config = new DocumentBuilder()
    .setTitle('COSS Backend API')
    .setDescription(
      '동국대학교 COSS 사이트 백엔드 API (계층형 카테고리, 관리자 /admin/**, S3 Presigned Upload, 디버깅 친화적 에러 응답)',
    )
    .setVersion('4.0.0')
    .addServer(swaggerServerUrl, process.env.NODE_ENV === 'production' ? 'Production' : 'Development')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Authorization: Bearer <JWT>',
      },
      'bearerAuth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT || 3001, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger docs available at: ${await app.getUrl()}/api-docs`);
  console.log(`CORS origins: ${JSON.stringify([...allowedOrigins, /^https:\/\/.*\.cloudfront\.net$/])}`);
}
bootstrap();
