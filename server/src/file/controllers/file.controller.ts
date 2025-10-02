import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { FileService } from '../services/file.service';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { PresignRequest, PresignResponse, FileCompleteRequest } from '../dto/file.dto';

@ApiTags('Files') 
@Controller('api/v1/files')
export class FileController {
  constructor(private fileService: FileService) {}

  @ApiOperation({ summary: '파일 업로드 URL 생성', description: 'S3 파일 업로드를 위한 Presigned URL을 생성합니다. (관리자 권한 필요)' })
  @ApiResponse({ status: 201, description: 'Presigned URL 생성 성공', type: PresignResponse })
  @Post('presign')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  async generatePresignedUrl(@Body() request: PresignRequest, @Request() req): Promise<PresignResponse> {
    return this.fileService.generatePresignedUrl(request, req.user.id);
  }

  @ApiOperation({ summary: '파일 업로드 완료', description: '파일 업로드 완료 후 메타데이터를 업데이트합니다.' })
  @ApiResponse({ status: 200, description: '파일 업로드 완료' })
  @Post('complete')
  @UseGuards(AdminGuard)
  async completeUpload(@Body() request: FileCompleteRequest) {
    return this.fileService.completeUpload(request);
  }

  @ApiOperation({ summary: '파일 정보 조회', description: '파일 키로 파일 정보를 조회합니다.' })
  @ApiParam({ name: 'fileKey', description: '파일 키' })
  @ApiResponse({ status: 200, description: '파일 정보 조회 성공' })
  @Get(':fileKey')
  async getFile(@Param('fileKey') fileKey: string) {
    return this.fileService.getFile(fileKey);
  }

  @ApiOperation({ summary: '소유자별 파일 목록', description: '특정 소유자의 파일 목록을 조회합니다.' })
  @ApiQuery({ name: 'ownerType', description: '소유자 타입' })
  @ApiQuery({ name: 'ownerId', description: '소유자 ID' })
  @ApiResponse({ status: 200, description: '파일 목록 조회 성공' })
  @Get()
  async getFilesByOwner(
    @Query('ownerType') ownerType: string,
    @Query('ownerId') ownerId: string
  ) {
    return this.fileService.getFilesByOwner(ownerType, ownerId);
  }

  @ApiOperation({ summary: '파일 삭제', description: '파일을 삭제합니다. (관리자 권한 필요)' })
  @ApiParam({ name: 'fileKey', description: '파일 키' })
  @ApiResponse({ status: 200, description: '파일 삭제 성공' })
  @Delete(':fileKey')
  @UseGuards(AdminGuard)
  async deleteFile(@Param('fileKey') fileKey: string, @Request() req) {
    return this.fileService.deleteFile(fileKey, req.user.id);
  }
}
