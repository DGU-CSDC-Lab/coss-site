import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { Course } from '@/course/entities';
import { CourseController } from '@/course/controllers/course.controller';
import { CourseService } from '@/course/services/course.service';

@Module({
  imports: [TypeOrmModule.forFeature([Course]), AuthModule],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
