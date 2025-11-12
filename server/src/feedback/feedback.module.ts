import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackController } from '@/feedback/controllers/feedback.controller';
import { FeedbackService } from '@/feedback/services/feedback.service';
import { Feedback } from '@/feedback/entities/feedback.entity';
import { AuthModule } from '@/auth/auth.module';
import { FileModule } from '@/file/file.module';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback]), AuthModule, FileModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
