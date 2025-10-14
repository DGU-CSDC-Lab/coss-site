import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { CategoryModule } from '@/category/category.module';
import { FileModule } from '@/file/file.module';
import { S3Service } from '@/file/services/s3.service';
import { BoardPost } from '@/board/entities';
import { User } from '@/auth/entities';
import { File } from '@/file/entities';
import { BoardController } from '@/board/controllers/board.controller';
import { BoardService } from '@/board/services/board.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BoardPost, User, File]),
    AuthModule,
    CategoryModule,
    FileModule,
  ],
  controllers: [BoardController],
  providers: [BoardService, S3Service],
})
export class BoardModule {}
