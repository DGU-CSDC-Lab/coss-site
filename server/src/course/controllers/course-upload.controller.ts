import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CourseUploadService } from '../services/course-upload.service';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { CourseUploadDto, CourseUploadResult } from '../dto/course-upload.dto';

@ApiTags('Course Upload')
@Controller('api/v1/admin/courses')
@UseGuards(AdminGuard)
export class CourseUploadController {
  constructor(private courseUploadService: CourseUploadService) {}

  @ApiOperation({
    summary: 'Excel 파일로 교육과정 일괄 업로드',
    description:
      'Excel 파일을 업로드하여 교육과정 데이터를 일괄 등록합니다. 같은 연도/학기의 기존 데이터는 삭제됩니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Excel 파일 (.xlsx, .xls)',
        },
        year: {
          type: 'integer',
          description: '연도',
          example: 2024,
        },
        semester: {
          type: 'string',
          description: '학기',
          example: '1학기',
        },
      },
      required: ['file', 'year', 'semester'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '업로드 성공',
    type: CourseUploadResult,
  })
  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadCourses(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: CourseUploadDto,
  ): Promise<CourseUploadResult> {
    return this.courseUploadService.uploadFromExcel(file, uploadDto);
  }

  @ApiOperation({
    summary: 'Excel 템플릿 다운로드',
    description: '교육과정 업로드용 Excel 템플릿 파일을 다운로드합니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'Excel 템플릿 파일',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Get('template')
  async downloadTemplate(@Res() res: Response): Promise<void> {
    const buffer = await this.courseUploadService.getExcelTemplate();

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="course-template.xlsx"',
      'Content-Length': buffer.length.toString(),
    });

    res.send(buffer);
  }
}
