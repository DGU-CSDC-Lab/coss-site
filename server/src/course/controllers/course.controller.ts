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
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CourseService } from '@/course/services/course.service';
import { RoleGuard } from '@/auth/guards/role.guard';
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
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/auth/entities';

@ApiTags('Courses')
@Controller()
export class CourseController {
  constructor(private courseService: CourseService) {}

  @Get('api/v1/courses/offering/search')
  @ApiOperation({ summary: '교과목 목록 검색' })
  async getCoursesOffering(@Query() query: CourseQuery): Promise<PagedResponse<CourseOfferingResponse>> {
    return this.courseService.findAllOfferings(query);
  }

  @Get('api/v1/courses/master/search')
  @ApiOperation({ summary: '교과목 목록 검색' })
  async getCoursesMaster(@Query() query: CourseQuery): Promise<PagedResponse<CourseMasterResponse>> {
    return this.courseService.findAllMasters(query);
  }

  @Get('api/v1/courses/offering/:id')
  @ApiOperation({ summary: '교과목 상세 조회' })
  @ApiResponse({ status: 404, description: '교과목을 찾을 수 없음' })
  async getCourse(@Param('id') id: string): Promise<CourseOfferingResponse> {
    return this.courseService.findOne(id);
  }

  @Post('api/v1/admin/courses/master')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '교과목 생성' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @HttpCode(HttpStatus.CREATED)
  async createCourseMaster(@Body() createDto: CourseMasterCreate): Promise<CourseMasterResponse> {
    return this.courseService.createMaster(createDto);
  }

  @Post('api/v1/admin/courses/offering')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Offering 교과목 생성' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @HttpCode(HttpStatus.CREATED)
  async createCourseOffering(@Body() createDto: CourseOfferingCreate): Promise<CourseOfferingResponse> {
    return this.courseService.createOffering(createDto);
  }

  @Put('api/v1/admin/courses/master/:id')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '교과목 수정' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '교과목을 찾을 수 없음' })
  async updateCourseMaster(
    @Param('id') id: string,
    @Body() updateDto: CourseMasterUpdate,
  ): Promise<CourseMasterResponse> {
    return this.courseService.updateMaster(id, updateDto);
  }

  @Put('api/v1/admin/courses/offering/:id')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '교과목 수정' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '교과목을 찾을 수 없음' })
  async updateCourseOffering(
    @Param('id') id: string,
    @Body() updateDto: CourseOfferingUpdate,
  ): Promise<CourseOfferingResponse> {
    return this.courseService.updateOffering(id, updateDto);
  }

  @Delete('api/v1/admin/courses/master/:id')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Master 교과목 삭제' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '교과목을 찾을 수 없음' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCourseMaster(@Param('id') id: string): Promise<void> {
    return this.courseService.deleteMaster(id);
  }

  @Delete('api/v1/admin/courses/offering/:id')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Offering 교과목 삭제' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '교과목을 찾을 수 없음' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCourseOffering(@Param('id') id: string): Promise<void> {
    return this.courseService.deleteOffering(id);
  }

  @Post('api/v1/admin/courses/master/bulk-init')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '년도/학기별 교과목 초기화' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @HttpCode(HttpStatus.CREATED)
  async bulkInitCoursesMaster(@Body() request: CourseBulkInitMasterRequest): Promise<CourseUploadResult> {
    return this.courseService.bulkInitMaster(request.year, request.semester, request.courses);
  }

  @Post('api/v1/admin/courses/offering/bulk-init')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '년도/학기별 교과목 초기화' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @HttpCode(HttpStatus.CREATED)
  async bulkInitCoursesOffering(@Body() request: CourseBulkInitOfferingRequest): Promise<CourseUploadResult> {
    return this.courseService.bulkInitOffering(request.year, request.semester, request.courses);
  }

  @Post('api/v1/admin/courses/master/upload')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '교과목 일괄 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 400, description: 'CSV 형식이 아니거나 헤더 행이 부족함' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadMasterCourses(@UploadedFile() file: Express.Multer.File): Promise<CourseUploadResult> {
    return this.courseService.uploadFromMasterFile(file.buffer, file.filename);
  }

  @Post('api/v1/admin/courses/offering/upload')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '교과목 일괄 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 400, description: 'CSV 형식이 아니거나 헤더 행이 부족함' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadOfferingCourses(@UploadedFile() file: Express.Multer.File): Promise<CourseUploadResult> {
    return this.courseService.uploadFromMasterFile(file.buffer, file.filename);
  }
}
