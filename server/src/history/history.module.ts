import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { History } from './entities';
import { HistoryController } from './controllers/history.controller';
import { HistoryService } from './services/history.service';

@Module({
  imports: [TypeOrmModule.forFeature([History]), AuthModule],
  controllers: [HistoryController],
  providers: [HistoryService],
})
export class HistoryModule {}
