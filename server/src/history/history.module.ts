import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { History } from '@/history/entities';
import { HistoryController } from '@/history/controllers/history.controller';
import { HistoryService } from '@/history/services/history.service';

@Module({
  imports: [TypeOrmModule.forFeature([History]), AuthModule],
  controllers: [HistoryController],
  providers: [HistoryService],
})
export class HistoryModule {}
