import {
  ApiTags,
  ApiOperation,
  ApiResponse,
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
import { RoleGuard } from '@/auth/guards/role.guard';
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
  @UseGuards(RoleGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Presigned URL 발급' })
  @ApiResponse({ status: 400, description: '업로드 할 수 없는 파일 타입이거나 파일 크기가 너무 큼' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @HttpCode(HttpStatus.OK)
  async generatePresignedUrl(
    @Body() request: PresignedUrlRequest,
    @Request() auth,
  ): Promise<PresignedUrlResponse> {
    return this.fileService.generatePresignedUrl(request, auth.user.id);
  }

  @Post('register')
  @UseGuards(RoleGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '파일 등록' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @HttpCode(HttpStatus.OK)
  async registerFile(
    @Body() request: RegisterFileRequest,
    @Request() auth,
  ): Promise<FileInfoResponse> {
    return this.fileService.registerFile(request, auth.user.id);
  }

  @Get('by-owner')
  @ApiOperation({ summary: '소유자별 파일 목록 조회' })
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
  @ApiOperation({ summary: '단일 파일 정보 조회' })
  @ApiResponse({ status: 404, description: '파일을 찾을 수 없음' })
  async getFile(@Param('fileId') fileId: string): Promise<File> {
    return this.fileService.getFile({ fileId });
  }

  @Delete(':fileId')
  @UseGuards(RoleGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '파일 삭제' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '파일을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: 'S3 객체 삭제 실패 또는 서버 내부 오류' })
  @HttpCode(HttpStatus.OK)
  async deleteFile(@Param('fileId') fileId: string): Promise<void> {
    return this.fileService.deleteFile({ fileId });
  }
}
