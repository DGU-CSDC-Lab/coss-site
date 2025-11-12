import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from '../entities/feedback.entity';
import { User } from '@/auth/entities';
import { CreateFeedbackRequest, FeedbackResponse } from '../dto/feedback.dto';
import { CommonException } from '@/common/exceptions';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createFeedback(
    userId: string,
    request: CreateFeedbackRequest,
  ): Promise<FeedbackResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      const feedback = this.feedbackRepository.create({
        title: request.title,
        content: request.content,
        type: request.type,
        imageUrls: request.imageUrls,
        userId,
        user,
      });

      const savedFeedback = await this.feedbackRepository.save(feedback);

      this.logger.log(`Feedback created: ${savedFeedback.id} by ${user.username}`);

      return {
        id: savedFeedback.id,
        title: savedFeedback.title,
        content: savedFeedback.content,
        type: savedFeedback.type,
        status: savedFeedback.status,
        imageUrls: savedFeedback.imageUrls,
        username: user.username,
        createdAt: savedFeedback.createdAt,
      };
    } catch (error) {
      this.logger.error(`Create feedback error: ${error.message}`, error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  async getFeedbacks(userId: string): Promise<FeedbackResponse[]> {
    try {
      const feedbacks = await this.feedbackRepository.find({
        where: { userId },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });

      return feedbacks.map(feedback => ({
        id: feedback.id,
        title: feedback.title,
        content: feedback.content,
        type: feedback.type,
        status: feedback.status,
        imageUrls: feedback.imageUrls,
        username: feedback.user.username,
        createdAt: feedback.createdAt,
      }));
    } catch (error) {
      this.logger.error(`Get feedbacks error: ${error.message}`, error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }
}
