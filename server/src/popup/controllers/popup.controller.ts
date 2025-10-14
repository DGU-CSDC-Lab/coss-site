import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { PopupService } from '@/popup/services/popup.service';
import { AdminGuard } from '@/auth/guards/admin.guard';
import {
  PopupCreate,
  PopupUpdate,
  PopupResponse,
  PopupQuery,
} from '@/popup/dto/popup.dto';
import { PagedResponse, SuccessResponse } from '@/common/dto/response.dto';

@ApiTags('Popups')
@Controller()
export class PopupController {
  constructor(private popupService: PopupService) {}

  @ApiOperation({
    summary: '팝업 목록 조회',
    description:
      '팝업 목록을 조회합니다. 페이지네이션과 활성 상태 필터링을 지원합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '팝업 목록 조회 성공',
    type: PagedResponse<PopupResponse>,
  })
  @Get('api/v1/popups')
  async getPopups(
    @Query() query: PopupQuery,
  ): Promise<PagedResponse<PopupResponse>> {
    return this.popupService.findAll(query);
  }

  @ApiOperation({
    summary: '활성 팝업 조회',
    description: '현재 활성화된 팝업들을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '활성 팝업 조회 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/PopupResponse' }
            }
          }
        }
      ]
    }
  })
  @Get('api/v1/popups/active')
  async getActivePopups(): Promise<PopupResponse[]> {
    return this.popupService.findActive();
  }

  @ApiOperation({
    summary: '팝업 상세 조회',
    description: 'ID로 특정 팝업의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '팝업 ID' })
  @ApiResponse({
    status: 200,
    description: '팝업 상세 조회 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/PopupResponse' }
          }
        }
      ]
    }
  })
  @Get('api/v1/popups/:id')
  async getPopup(@Param('id') id: string): Promise<PopupResponse> {
    return this.popupService.findOne(id);
  }

  @ApiOperation({
    summary: '팝업 생성',
    description: '새로운 팝업을 생성합니다. (관리자 권한 필요)',
  })
  @ApiResponse({
    status: 201,
    description: '팝업 생성 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/PopupResponse' }
          }
        }
      ]
    }
  })
  @Post('api/v1/admin/popups')
  @UseGuards(AdminGuard)
  async createPopup(
    @Body() createDto: PopupCreate,
    @Request() req,
  ): Promise<PopupResponse> {
    return this.popupService.create(createDto, req.user.id);
  }

  @ApiOperation({
    summary: '팝업 수정',
    description: '기존 팝업 정보를 수정합니다. (관리자 권한 필요)',
  })
  @ApiParam({ name: 'id', description: '팝업 ID' })
  @ApiResponse({
    status: 200,
    description: '팝업 수정 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/PopupResponse' }
          }
        }
      ]
    }
  })
  @Put('api/v1/admin/popups/:id')
  @UseGuards(AdminGuard)
  async updatePopup(
    @Param('id') id: string,
    @Body() updateDto: PopupUpdate,
  ): Promise<PopupResponse> {
    return this.popupService.update(id, updateDto);
  }

  @ApiOperation({
    summary: '팝업 삭제',
    description: '팝업을 삭제합니다. (관리자 권한 필요)',
  })
  @ApiParam({ name: 'id', description: '팝업 ID' })
  @ApiResponse({ status: 204, description: '팝업 삭제 성공' })
  @Delete('api/v1/admin/popups/:id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePopup(@Param('id') id: string): Promise<void> {
    return this.popupService.delete(id);
  }
}
