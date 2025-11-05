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
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { CourseService } from '@/course/services/course.service';
import { AdminGuard } from '@/auth/guards/admin.guard';
import {
  CourseMasterCreate,
  CourseMasterUpdate,
  CourseOfferingCreate,
  CourseOfferingUpdate,
  CourseMasterResponse,
  CourseOfferingResponse,
  CourseQuery,
  CourseUploadResult,
  CourseBulkInitMasterRequest,
  CourseBulkInitOfferingRequest,
} from '@/course/dto/course.dto';
import { PagedResponse } from '@/common/dto/response.dto';

@ApiTags('Courses')
@Controller()
export class CourseController {
  constructor(private courseService: CourseService) {}

  @Get('api/v1/courses/offering/search')
  @ApiOperation({
    summary: '교과목 목록 검색',
    description:
      '페이지네이션, 검색, 정렬을 지원하는 교과목 목록을 조회합니다. 과목명, 학과, 학수번호, 수강학년으로 검색 및 정렬 가능합니다.',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: '연도 필터',
    example: 2024,
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: '학기 필터',
    example: '1학기',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: '학과명 검색',
    example: '지능IoT학과',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: '교과목명 검색',
    example: '프로그래밍',
  })
  @ApiQuery({
    name: 'code',
    required: false,
    description: '교과목 코드 검색',
    example: 'CS101',
  })
  @ApiQuery({
    name: 'grade',
    required: false,
    description: '학년 검색',
    example: '1',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: '정렬 기준',
    example: 'name',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: '정렬 순서',
    example: 'ASC',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호',
    example: 1,
  })
  @ApiQuery({
    name: 'size',
    required: false,
    description: '페이지 크기',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: '교과목 목록 조회 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/CourseOfferingResponse',
                  },
                },
                meta: {
                  type: 'object',
                  properties: {
                    page: { type: 'number' },
                    size: { type: 'number' },
                    totalElements: { type: 'number' },
                    totalPages: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async getCoursesOffering(
    @Query() query: CourseQuery,
  ): Promise<PagedResponse<CourseOfferingResponse>> {
    return this.courseService.findAllOfferings(query);
  }

  @Get('api/v1/courses/master/search')
  @ApiOperation({
    summary: '교과목 목록 검색',
    description:
      '페이지네이션, 검색, 정렬을 지원하는 교과목 목록을 조회합니다. 과목명, 학과, 학수번호, 수강학년으로 검색 및 정렬 가능합니다.',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: '학기 필터',
    example: '1학기',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: '학과명 검색',
    example: '지능IoT학과',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: '교과목명 검색',
    example: '프로그래밍',
  })
  @ApiQuery({
    name: 'code',
    required: false,
    description: '교과목 코드 검색',
    example: 'CS101',
  })
  @ApiQuery({
    name: 'grade',
    required: false,
    description: '학년 검색',
    example: '1',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: '정렬 기준',
    example: 'name',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: '정렬 순서',
    example: 'ASC',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호',
    example: 1,
  })
  @ApiQuery({
    name: 'size',
    required: false,
    description: '페이지 크기',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: '교과목 목록 조회 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/CourseMasterResponse' },
                },
                meta: {
                  type: 'object',
                  properties: {
                    page: { type: 'number' },
                    size: { type: 'number' },
                    totalElements: { type: 'number' },
                    totalPages: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async getCoursesMaster(
    @Query() query: CourseQuery,
  ): Promise<PagedResponse<CourseMasterResponse>> {
    return this.courseService.findAllMasters(query);
  }

  @Get('api/v1/courses/offering/:id')
  @ApiOperation({
    summary: '교과목 상세 조회',
    description: 'ID로 특정 교과목의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '교과목 ID' })
  @ApiResponse({
    status: 200,
    description: '교과목 상세 조회 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/CourseOfferingResponse' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: '교과목을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async getCourse(@Param('id') id: string): Promise<CourseOfferingResponse> {
    return this.courseService.findOne(id);
  }

  @Post('api/v1/admin/courses/master')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '교과목 생성',
    description: '새로운 교과목을 생성합니다. (관리자 권한 필요)',
  })
  @ApiBody({ type: CourseMasterCreate })
  @ApiResponse({
    status: 201,
    description: '교과목 생성 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/CourseMasterResponse' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.CREATED)
  async createCourseMaster(
    @Body() createDto: CourseMasterCreate,
  ): Promise<CourseMasterResponse> {
    return this.courseService.createMaster(createDto);
  }

  @Post('api/v1/admin/courses/offering')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: 'Offering 교과목 생성',
    description: '새로운 Offering 교과목을 생성합니다. (관리자 권한 필요)',
  })
  @ApiBody({ type: CourseOfferingCreate })
  @ApiResponse({
    status: 201,
    description: 'Offering 교과목 생성 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/CourseResponse' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.CREATED)
  async createCourseOffering(
    @Body() createDto: CourseOfferingCreate,
  ): Promise<CourseOfferingResponse> {
    return this.courseService.createOffering(createDto);
  }

  @Put('api/v1/admin/courses/master/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '교과목 수정',
    description: '기존 교과목 정보를 수정합니다. (관리자 권한 필요)',
  })
  @ApiParam({ name: 'id', description: '교과목 ID' })
  @ApiBody({ type: CourseMasterUpdate })
  @ApiResponse({
    status: 200,
    description: '교과목 수정 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/CourseMasterResponse' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '교과목을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async updateCourseMaster(
    @Param('id') id: string,
    @Body() updateDto: CourseMasterUpdate,
  ): Promise<CourseMasterResponse> {
    return this.courseService.updateMaster(id, updateDto);
  }

  @Put('api/v1/admin/courses/offering/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '교과목 수정',
    description: '기존 교과목 정보를 수정합니다. (관리자 권한 필요)',
  })
  @ApiParam({ name: 'id', description: '교과목 ID' })
  @ApiBody({ type: CourseOfferingUpdate })
  @ApiResponse({
    status: 200,
    description: '교과목 수정 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/CourseOfferingResponse' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '교과목을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async updateCourseOffering(
    @Param('id') id: string,
    @Body() updateDto: CourseOfferingUpdate,
  ): Promise<CourseOfferingResponse> {
    return this.courseService.updateOffering(id, updateDto);
  }

  @Delete('api/v1/admin/courses/master/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: 'Master 교과목 삭제',
    description: '교과목을 삭제합니다. (관리자 권한 필요)',
  })
  @ApiParam({ name: 'id', description: '교과목 ID' })
  @ApiResponse({ status: 204, description: '교과목 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '교과목을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCourseMaster(@Param('id') id: string): Promise<void> {
    return this.courseService.deleteMaster(id);
  }

  @Delete('api/v1/admin/courses/offering/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: 'Offering 교과목 삭제',
    description: '교과목을 삭제합니다. (관리자 권한 필요)',
  })
  @ApiParam({ name: 'id', description: '교과목 ID' })
  @ApiResponse({ status: 204, description: '교과목 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '교과목을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCourseOffering(@Param('id') id: string): Promise<void> {
    return this.courseService.deleteOffering(id);
  }

  @Post('api/v1/admin/courses/master/bulk-init')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '년도/학기별 교과목 초기화',
    description:
      '특정 년도/학기의 모든 교과목을 삭제하고 새로운 교과목 목록으로 초기화합니다. (관리자 권한 필요)',
  })
  @ApiBody({ type: CourseBulkInitMasterRequest })
  @ApiResponse({
    status: 201,
    description: '교과목 초기화 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/CourseUploadResult' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.CREATED)
  async bulkInitCoursesMaster(
    @Body() request: CourseBulkInitMasterRequest,
  ): Promise<CourseUploadResult> {
    return this.courseService.bulkInitMaster(
      request.year,
      request.semester,
      request.courses,
    );
  }

  @Post('api/v1/admin/courses/offering/bulk-init')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '년도/학기별 교과목 초기화',
    description:
      '특정 년도/학기의 모든 교과목을 삭제하고 새로운 교과목 목록으로 초기화합니다. (관리자 권한 필요)',
  })
  @ApiBody({ type: CourseBulkInitOfferingRequest })
  @ApiResponse({
    status: 201,
    description: '교과목 초기화 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/CourseUploadResult' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.CREATED)
  async bulkInitCoursesOffering(
    @Body() request: CourseBulkInitOfferingRequest,
  ): Promise<CourseUploadResult> {
    return this.courseService.bulkInitOffering(
      request.year,
      request.semester,
      request.courses,
    );
  }

  @Post('api/v1/admin/courses/master/upload')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '교과목 일괄 업로드',
    description: 'CSV 파일로 교과목을 일괄 업로드합니다. (관리자 권한 필요)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: '교과목 업로드 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/CourseUploadMasterResult' },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'CSV 형식이 아니거나 헤더 행이 부족함',
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadMasterCourses(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CourseUploadResult> {
    return this.courseService.uploadFromMasterFile(file.buffer, file.filename);
  }

  @Post('api/v1/admin/courses/offering/upload')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '교과목 일괄 업로드',
    description: 'CSV 파일로 교과목을 일괄 업로드합니다. (관리자 권한 필요)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: '교과목 업로드 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/CourseUploadOfferingResult' },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'CSV 형식이 아니거나 헤더 행이 부족함',
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadOfferingCourses(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CourseUploadResult> {
    return this.courseService.uploadFromMasterFile(file.buffer, file.filename);
  }
}
