import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { AcademicSchedule } from '@/schedule/entities';
import { ScheduleController } from '@/schedule/controllers/schedule.controller';
import { ScheduleService } from '@/schedule/services/schedule.service';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicSchedule]), AuthModule],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
