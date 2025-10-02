import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CategoryModule } from '../category/category.module';
import { BoardPost, PostFile } from './entities';
import { User } from '../auth/entities';
import { BoardController } from './controllers/board.controller';
import { BoardService } from './services/board.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BoardPost, PostFile, User]),
    AuthModule,
    CategoryModule,
  ],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
