import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { FileModule } from '@/file/file.module';
import { FacultyMember } from '@/faculty/entities';
import { FacultyController } from '@/faculty/controllers/faculty.controller';
import { FacultyService } from '@/faculty/services/faculty.service';

@Module({
  imports: [TypeOrmModule.forFeature([FacultyMember]), AuthModule, FileModule],
  controllers: [FacultyController],
  providers: [FacultyService],
})
export class FacultyModule {}
