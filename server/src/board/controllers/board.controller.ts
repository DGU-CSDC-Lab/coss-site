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
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BoardService } from '@/board/services/board.service';
import { RoleGuard } from '@/auth/guards/role.guard';
import {
  PostCreateRequest,
  PostUpdateRequest,
  PostListQuery,
  AdminPostListQuery,
  PostResponse,
  PostDetailResponse,
} from '@/board/dto/post.dto';
import { PagedResponse } from '@/common/dto/response.dto';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/auth/entities';

@ApiTags('Posts')
@Controller()
export class BoardController {
  constructor(private boardService: BoardService) {}

  @Get('api/v1/posts')
  @ApiOperation({ summary: '공개 게시글 목록 조회' })
  async getPosts(@Query() rawQuery: any): Promise<PagedResponse<PostResponse>> {
    const query: PostListQuery = {
      category: rawQuery.category,
      keyword: rawQuery.keyword,
      page: rawQuery.page ? parseInt(rawQuery.page) : 1,
      size: rawQuery.size ? parseInt(rawQuery.size) : 10,
      sort: rawQuery.sort || 'latest',
    };
    return this.boardService.findAll(query);
  }

  @Get('api/v1/posts/:id')
  @ApiOperation({ summary: '공개 게시글 상세 조회' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async getPost(@Param('id') id: string): Promise<PostDetailResponse> {
    return this.boardService.findOne(id, false);
  }

  @Get('api/v1/admin/posts')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '관리자 게시글 목록 조회' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  async getAdminPosts(@Query() rawQuery: any): Promise<PagedResponse<PostResponse>> {
    const query: AdminPostListQuery = {
      status: rawQuery.status,
      category: rawQuery.category,
      keyword: rawQuery.keyword,
      page: rawQuery.page ? parseInt(rawQuery.page) : 1,
      size: rawQuery.size ? parseInt(rawQuery.size) : 10,
      sort: rawQuery.sort || 'latest',
    };
    return this.boardService.findAllForAdmin(query);
  }

  @Get('api/v1/admin/posts/:id')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '관리자 게시글 상세 조회' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async getAdminPost(@Param('id') id: string): Promise<PostDetailResponse> {
    return this.boardService.findOne(id, true);
  }

  @Post('api/v1/admin/posts')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '게시글 생성' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  async createPost(
    @Body() createDto: PostCreateRequest,
    @Request() req,
  ): Promise<PostDetailResponse> {
    return this.boardService.create(createDto, req.user.id);
  }

  @Put('api/v1/admin/posts/:id')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '게시글 수정' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async updatePost(
    @Param('id') id: string,
    @Body() updateDto: PostUpdateRequest,
  ): Promise<PostDetailResponse> {
    return this.boardService.update(id, updateDto);
  }

  @Delete('api/v1/admin/posts/:id')
  @UseGuards(RoleGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '게시글 삭제' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {
    return this.boardService.delete(id);
  }
}
