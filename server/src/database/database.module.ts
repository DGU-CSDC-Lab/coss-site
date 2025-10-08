import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseSeeder } from './database.seeder';

// Import entities directly from domains
import { Account, User } from '../auth/entities';
import { BoardPost, PostFile } from '../board/entities';
import { AcademicSchedule } from '../schedule/entities';
import { File } from '../file/entities';
import { Popup } from '../popup/entities';
import { FacultyMember } from '../faculty/entities';
import { History } from '../history/entities';
import { Course } from '../course/entities';
import { Category } from '../category/entities';
import { HeaderAsset } from '../header-asset/entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [
          Account,
          User,
          BoardPost,
          PostFile,
          AcademicSchedule,
          File,
          Popup,
          FacultyMember,
          History,
          Course,
          Category,
          HeaderAsset,
        ],
        synchronize: true, // 개발환경에서만 사용
        logging: true,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [DatabaseSeeder],
})
export class DatabaseModule {}
