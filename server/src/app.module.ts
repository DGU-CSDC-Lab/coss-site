import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '@/database/database.module';
import { CommonModule } from '@/common/common.module';
import { AuthModule } from '@/auth/auth.module';
import { CategoryModule } from '@/category/category.module';
import { BoardModule } from '@/board/board.module';
import { ScheduleModule } from '@/schedule/schedule.module';
import { CourseModule } from '@/course/course.module';
import { PopupModule } from '@/popup/popup.module';
import { FacultyModule } from '@/faculty/faculty.module';
import { HistoryModule } from '@/history/history.module';
import { FileModule } from '@/file/file.module';
import { HeaderAssetModule } from '@/header-asset/header-asset.module';
import { HealthModule } from '@/health/health.module';
import { OpenTelemetryModule } from 'nestjs-otel';
import { WinstonModule } from 'nest-winston';
const LokiTransport = require('winston-loki');
import { format, transports } from 'winston';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

// Root application module
@Module({
  imports: [
    // Environment variables 설정
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'local'
          ? '.env.local'
          : `.env.${process.env.NODE_ENV}`, // Todo:: node_env를 production -> prod로 수정 필요함.
      isGlobal: true, // 전역 모듈로 설정 - 어디서든 주입 받을 수 있음.
    }),
    CommonModule,
    DatabaseModule,
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const ENV = configService.get<string>('NODE_ENV', 'local');
        const NAME = configService.get<string>('APP_NAME', 'iot-site');
        const LOKI_HOST = configService.get<string>(
          'LOKI_HOST',
          'http://localhost:3100',
        );

        const baseFormat = format.combine(
          format.timestamp(),
          format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
          }),
        );

        // production/staging
        if (ENV !== 'local' && ENV !== 'test') {
          return {
            transports: [
              new transports.Console({
                level: 'info',
                format: baseFormat,
              }),
              new LokiTransport({
                host: LOKI_HOST,
                labels: { app: `${ENV}-${NAME}` },
                format: baseFormat,
              }),
            ],
          };
        }

        // local/test 환경
        return {
          transports: [
            new transports.Console({
              level: 'debug',
              format: baseFormat,
            }),
          ],
        };
      },
    }),
    OpenTelemetryModule.forRoot({
      metrics: {
        hostMetrics: true,
      },
    }),
    CategoryModule,
    BoardModule,
    ScheduleModule,
    CourseModule,
    PopupModule,
    FacultyModule,
    HistoryModule,
    FileModule,
    HeaderAssetModule,
    HealthModule,
    AuthModule,
  ],
  providers: [
    {
      provide: PrometheusExporter,
      useFactory: () => {
        const exporter = new PrometheusExporter(
          {
            port: 9464,
            endpoint: '/metrics',
          },
          () => {
            console.log(
              'Prometheus scrape endpoint available at http://localhost:9464/metrics',
            );
          },
        );
        return exporter;
      },
    },
  ],
})
export class AppModule {}
