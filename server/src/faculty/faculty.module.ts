import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { FacultyMember } from './entities';
import { FacultyController } from './controllers/faculty.controller';
import { FacultyService } from './services/faculty.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FacultyMember]),
    AuthModule,
  ],
  controllers: [FacultyController],
  providers: [FacultyService],
})
export class FacultyModule {}
