import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { FileService } from '@/file/services/file.service';
import { AdminGuard } from '@/auth/guards/admin.guard';
import {
  PresignedUrlRequest,
  PresignedUrlResponse,
  RegisterFileRequest,
  FileInfoResponse,
  GetFilesByOwnerRequest,
} from '@/file/dto/file.dto';
import { PagedResponse } from '@/common';
import { File } from '@/file/entities/file.entity';

@ApiTags('Files')
@Controller('api/v1/files')
export class FileController {
  constructor(private fileService: FileService) {}

  @Post('presigned-url')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: 'Presigned URL 발급',
    description: 'S3 파일 업로드를 위한 Presigned URL을 생성합니다.',
  })
  @ApiBody({ type: PresignedUrlRequest })
  @ApiResponse({
    status: 200,
    description: 'Presigned URL 생성 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/PresignedUrlResponse' }
          }
        }
      ]
    }
  })
  @ApiResponse({
    status: 400,
    description: '업로드 할 수 없는 파일 타입이거나 파일 크기가 너무 큼',
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.OK)
  async generatePresignedUrl(
    @Body() request: PresignedUrlRequest,
    @Request() auth,
  ): Promise<PresignedUrlResponse> {
    return this.fileService.generatePresignedUrl(request, auth.user.id);
  }

  @Post('register')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '파일 등록',
    description: '업로드 완료된 파일의 메타데이터를 등록합니다.',
  })
  @ApiBody({ type: RegisterFileRequest })
  @ApiResponse({
    status: 200,
    description: '파일 등록 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/FileInfoResponse' }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.OK)
  async registerFile(
    @Body() request: RegisterFileRequest,
    @Request() auth,
  ): Promise<FileInfoResponse> {
    return this.fileService.registerFile(request, auth.user.id);
  }

  @Get('by-owner')
  @ApiOperation({
    summary: '소유자별 파일 목록 조회',
    description: '특정 소유자의 파일 목록을 조회합니다.',
  })
  @ApiQuery({ name: 'ownerType', description: '소유자 타입', example: 'POST' })
  @ApiQuery({ name: 'ownerId', description: '소유자 ID', example: '1234' })
  @ApiResponse({
    status: 200,
    description: '파일 목록 조회 성공',
    schema: {
      type: 'object',
      properties: {
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            size: { type: 'number', example: 10 },
            totalElements: { type: 'number', example: 45 },
            totalPages: { type: 'number', example: 5 }
          }
        },
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/FileInfoResponse' }
        }
      }
    }
  })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async getFilesByOwner(
    @Query('ownerType') ownerType: string,
    @Query('ownerId') ownerId: string,
  ): Promise<PagedResponse<FileInfoResponse>> {
    const request: GetFilesByOwnerRequest = {
      ownerType: ownerType as any,
      ownerId,
    };
    return this.fileService.getFilesByOwner(request);
  }

  @Get(':fileId')
  @ApiOperation({
    summary: '단일 파일 정보 조회',
    description: '파일 ID로 파일 정보를 조회합니다.',
  })
  @ApiParam({ name: 'fileId', description: '파일 ID' })
  @ApiResponse({ 
    status: 200, 
    description: '파일 정보 조회 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/File' }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 404, description: '파일을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async getFile(@Param('fileId') fileId: string): Promise<File> {
    return this.fileService.getFile({ fileId });
  }

  @Delete(':fileId')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '파일 삭제',
    description: '파일을 삭제합니다. (논리 삭제 + S3 삭제)',
  })
  @ApiParam({ name: 'fileId', description: '파일 ID' })
  @ApiResponse({ 
    status: 200, 
    description: '파일 삭제 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { type: 'object', properties: { message: { type: 'string' } } }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '파일을 찾을 수 없음' })
  @ApiResponse({
    status: 500,
    description: 'S3 객체 삭제 실패 또는 서버 내부 오류',
  })
  @HttpCode(HttpStatus.OK)
  async deleteFile(@Param('fileId') fileId: string): Promise<void> {
    return this.fileService.deleteFile({ fileId });
  }
}
