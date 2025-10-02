import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Popup } from './entities';
import { PopupController } from './controllers/popup.controller';
import { PopupService } from './services/popup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Popup]),
    AuthModule,
  ],
  controllers: [PopupController],
  providers: [PopupService],
})
export class PopupModule {}
