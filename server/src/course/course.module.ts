import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { CourseMaster, CourseOffering } from '@/course/entities';
import { CourseController } from '@/course/controllers/course.controller';
import { CourseService } from '@/course/services/course.service';

@Module({
  imports: [TypeOrmModule.forFeature([CourseMaster, CourseOffering]), AuthModule],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
