import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { FileModule } from '@/file/file.module';
import { HeaderAsset } from '@/header-asset/entities';
import { HeaderAssetController } from '@/header-asset/controllers/header-asset.controller';
import { HeaderAssetService } from '@/header-asset/services/header-asset.service';

@Module({
  imports: [TypeOrmModule.forFeature([HeaderAsset]), AuthModule, FileModule],
  controllers: [HeaderAssetController],
  providers: [HeaderAssetService],
  exports: [HeaderAssetService],
})
export class HeaderAssetModule {}
