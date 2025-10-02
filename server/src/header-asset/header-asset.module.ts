import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { HeaderAsset } from './entities';
import { HeaderAssetController } from './controllers/header-asset.controller';
import { HeaderAssetService } from './services/header-asset.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HeaderAsset]),
    AuthModule,
  ],
  controllers: [HeaderAssetController],
  providers: [HeaderAssetService],
  exports: [HeaderAssetService],
})
export class HeaderAssetModule {}
