import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseSeeder } from '@/database/database.seeder';

// Import entities directly from domains
import { Account, User, PendingUser, PasswordResetToken } from '@/auth/entities';
import { BoardPost } from '@/board/entities';
import { AcademicSchedule } from '@/schedule/entities';
import { File } from '@/file/entities';
import { Popup } from '@/popup/entities';
import { FacultyMember } from '@/faculty/entities';
import { History } from '@/history/entities';
import { CourseMaster, CourseOffering } from '@/course/entities';
import { Category } from '@/category/entities';
import { HeaderAsset } from '@/header-asset/entities';

@Module({
  imports: [
    // forRootAsync: 비동기 설정 지원 - Global Module도 주입 필요함
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // app.module.ts에서 ConfigModule을 가져옴
      inject: [ConfigService], // 의존성 주입
      useFactory: (configService: ConfigService) => ({
        type: 'mysql', // mariaDB도 mysql 드라이버 사용
        host: configService.get('DB_HOST'), // .env에서 가져오는 값들
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        charset: 'utf8mb4',
        entities: [
          Account,
          User,
          PendingUser,
          PasswordResetToken,
          BoardPost,
          AcademicSchedule,
          File,
          Popup,
          FacultyMember,
          History,
          CourseMaster,
          CourseOffering,
          Category,
          HeaderAsset,
        ],
        synchronize: process.env.NODE_ENV !== 'production', // 임시로 활성화
        logging: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : true, // 프로덕션에서는 에러/경고만
        dropSchema: false, // production에서는 false로 설정
      }),
    }),
  ],
  providers: [DatabaseSeeder], // DI 컨테이너에 등록
})
export class DatabaseModule {}
