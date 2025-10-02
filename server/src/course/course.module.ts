import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Course } from './entities';
import { CourseController } from './controllers/course.controller';
import { CourseUploadController } from './controllers/course-upload.controller';
import { CourseService } from './services/course.service';
import { CourseUploadService } from './services/course-upload.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    AuthModule,
  ],
  controllers: [CourseController, CourseUploadController],
  providers: [CourseService, CourseUploadService],
})
export class CourseModule {}
