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
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { CourseService } from '../services/course.service';
import { AdminGuard } from '../../auth/guards/admin.guard';
import {
  CourseCreate,
  CourseUpdate,
  CourseResponse,
  CourseQuery,
  CourseUploadResult,
  CourseBulkInitRequest,
} from '../dto/course.dto';
import { PagedResponse } from '../../common/dto/pagination.dto';

@ApiTags('Courses')
@Controller()
export class CourseController {
  constructor(private courseService: CourseService) {}

  @ApiOperation({
    summary: '교과목 목록 조회',
    description:
      '페이지네이션, 검색, 정렬을 지원하는 교과목 목록을 조회합니다. 과목명, 학과, 학수번호, 수강학년으로 검색 및 정렬 가능합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '교과목 목록 조회 성공',
    type: PagedResponse<CourseResponse>,
  })
  @Get('api/v1/courses')
  async getCourses(
    @Query() query: CourseQuery,
  ): Promise<PagedResponse<CourseResponse>> {
    return this.courseService.findAll(query);
  }

  @ApiOperation({
    summary: '교과목 상세 조회',
    description: 'ID로 특정 교과목의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '교과목 ID' })
  @ApiResponse({
    status: 200,
    description: '교과목 상세 조회 성공',
    type: CourseResponse,
  })
  @Get('api/v1/courses/:id')
  async getCourse(@Param('id') id: string): Promise<CourseResponse> {
    return this.courseService.findOne(id);
  }

  @ApiOperation({
    summary: '교과목 생성',
    description: '새로운 교과목을 생성합니다. (관리자 권한 필요)',
  })
  @ApiResponse({
    status: 201,
    description: '교과목 생성 성공',
    type: CourseResponse,
  })
  @Post('api/v1/admin/courses')
  @UseGuards(AdminGuard)
  async createCourse(@Body() createDto: CourseCreate): Promise<CourseResponse> {
    return this.courseService.create(createDto);
  }

  @ApiOperation({
    summary: '교과목 수정',
    description: '기존 교과목 정보를 수정합니다. (관리자 권한 필요)',
  })
  @ApiParam({ name: 'id', description: '교과목 ID' })
  @ApiResponse({
    status: 200,
    description: '교과목 수정 성공',
    type: CourseResponse,
  })
  @Put('api/v1/admin/courses/:id')
  @UseGuards(AdminGuard)
  async updateCourse(
    @Param('id') id: string,
    @Body() updateDto: CourseUpdate,
  ): Promise<CourseResponse> {
    return this.courseService.update(id, updateDto);
  }

  @ApiOperation({
    summary: '교과목 삭제',
    description: '교과목을 삭제합니다. (관리자 권한 필요)',
  })
  @ApiParam({ name: 'id', description: '교과목 ID' })
  @ApiResponse({ status: 204, description: '교과목 삭제 성공' })
  @Delete('api/v1/admin/courses/:id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCourse(@Param('id') id: string): Promise<void> {
    return this.courseService.delete(id);
  }

  @ApiOperation({
    summary: '년도/학기별 교과목 초기화',
    description:
      '특정 년도/학기의 모든 교과목을 삭제하고 새로운 교과목 목록으로 초기화합니다. (관리자 권한 필요)',
  })
  @ApiResponse({
    status: 201,
    description: '교과목 초기화 성공',
    type: CourseUploadResult,
  })
  @Post('api/v1/admin/courses/bulk-init')
  @UseGuards(AdminGuard)
  async bulkInitCourses(
    @Body() request: CourseBulkInitRequest,
  ): Promise<CourseUploadResult> {
    return this.courseService.bulkInit(
      request.year,
      request.semester,
      request.courses,
    );
  }

  @ApiOperation({
    summary: '교과목 일괄 업로드',
    description: 'Excel 파일로 교과목을 일괄 업로드합니다. (관리자 권한 필요)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: '교과목 업로드 성공',
    type: CourseUploadResult,
  })
  @Post('api/v1/admin/courses/upload')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadCourses(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CourseUploadResult> {
    return this.courseService.uploadFromFile(file.buffer, file.originalname);
  }
}
