import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from '../services/feedback.service';
import { CreateFeedbackRequest, FeedbackResponse } from '../dto/feedback.dto';
import { RoleGuard } from '@/auth/guards/role.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/auth/entities';

@ApiTags('Feedback')
@Controller()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('api/v1/feedback')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMINISTRATOR, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '개발자에게 건의사항 작성' })
  @HttpCode(HttpStatus.CREATED)
  async createFeedback(
    @Request() req: any,
    @Body() request: CreateFeedbackRequest,
  ): Promise<FeedbackResponse> {
    return this.feedbackService.createFeedback(req.user.id, request);
  }

  @Get('api/v1/feedback')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMINISTRATOR, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '내 건의사항 목록 조회' })
  @HttpCode(HttpStatus.OK)
  async getFeedbacks(@Request() req: any): Promise<FeedbackResponse[]> {
    return this.feedbackService.getFeedbacks(req.user.id);
  }
}
