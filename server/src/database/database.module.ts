import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseSeeder } from './database.seeder';

// Import entities directly from domains
import { Account, User } from '../auth/entities';
import { BoardPost, PostFile } from '../board/entities';
import { AcademicSchedule } from '../schedule/entities';
import {
  CustomTable,
  CustomTableColumn,
  CustomTableRow,
} from '../custom-table/entities';
import { File } from '../file/entities';
import { Popup } from '../popup/entities';
import { FacultyMember } from '../faculty/entities';
import { History } from '../history/entities';
import { Course } from '../course/entities';
import { Category } from '../category/entities';
import { HeaderAsset } from '../header-asset/entities';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3308,
      username: process.env.DB_USERNAME || 'iot_user',
      password: process.env.DB_PASSWORD || 'iot_password',
      database: process.env.DB_DATABASE || 'iot_site',
      entities: [
        Account,
        User,
        BoardPost,
        PostFile,
        AcademicSchedule,
        CustomTable,
        CustomTableColumn,
        CustomTableRow,
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
  ],
  providers: [DatabaseSeeder],
})
export class DatabaseModule {}
