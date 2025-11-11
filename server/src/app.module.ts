import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@/database/database.module';
import { LoggerModule } from 'nestjs-pino';
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
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' } // 개발 시 컬러 + 가독성 로그
            : undefined,
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
})
export class AppModule {}
