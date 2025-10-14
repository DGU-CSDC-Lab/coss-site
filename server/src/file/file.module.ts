import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileController } from '@/file/controllers/file.controller';
import { FileService } from '@/file/services/file.service';
import { S3Service } from '@/file/services/s3.service';
import { File } from '@/file/entities';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    AuthModule, // AdminGuard 의존성 해결
  ],
  controllers: [FileController],
  providers: [FileService, S3Service],
  exports: [FileService, S3Service],
})
export class FileModule {}
