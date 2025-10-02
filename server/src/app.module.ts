import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { BoardModule } from './board/board.module';
import { ScheduleModule } from './schedule/schedule.module';
import { CourseModule } from './course/course.module';
import { PopupModule } from './popup/popup.module';
import { FacultyModule } from './faculty/faculty.module';
import { HistoryModule } from './history/history.module';
import { FileModule } from './file/file.module';
import { HeaderAssetModule } from './header-asset/header-asset.module';

@Module({
  imports: [
    CommonModule,
    DatabaseModule, 
    AuthModule, 
    CategoryModule, 
    BoardModule, 
    ScheduleModule, 
    CourseModule,
    PopupModule,
    FacultyModule,
    HistoryModule,
    FileModule,
    HeaderAssetModule,
  ],
})
export class AppModule {}
