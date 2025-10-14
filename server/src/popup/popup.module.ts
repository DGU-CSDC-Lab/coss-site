import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { Popup } from '@/popup/entities';
import { PopupController } from '@/popup/controllers/popup.controller';
import { PopupService } from '@/popup/services/popup.service';

@Module({
  imports: [TypeOrmModule.forFeature([Popup]), AuthModule], // popup 엔티티, 인증 모듈 등록
  controllers: [PopupController],
  providers: [PopupService],
})
export class PopupModule {}
