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
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BoardService } from '../services/board.service';
import { AdminGuard } from '../../auth/guards/admin.guard';
import {
  PostCreateRequest,
  PostUpdateRequest,
  PostListQuery,
  AdminPostListQuery,
  PostResponse,
  PostDetailResponse,
} from '../dto/post.dto';
import { PagedResponse } from '../../common/dto/response.dto';
import { PostStatus } from '../entities/board-post.entity';

@ApiTags('Posts')
@Controller()
export class BoardController {
  constructor(private boardService: BoardService) {}

  @Get('api/v1/posts')
  @ApiOperation({
    summary: '공개 게시글 목록 조회',
    description: '공개 상태의 게시글 목록을 페이징하여 조회합니다.',
  })
  @ApiQuery({
    name: 'categoryName',
    required: false,
    description: '카테고리명 필터',
  })
  @ApiQuery({
    name: 'keyword',
    required: false,
    description: '제목/내용 검색 키워드',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호 (기본값: 1)',
  })
  @ApiQuery({
    name: 'size',
    required: false,
    description: '페이지 크기 (기본값: 10)',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['latest', 'popular'],
    description: '정렬 방식 (기본값: latest)',
  })
  @ApiResponse({ status: 200, description: '공개 게시글 목록', type: PagedResponse })
  async getPosts(@Query() rawQuery: any): Promise<PagedResponse<PostResponse>> {
    const query: PostListQuery = {
      categoryName: rawQuery.categoryName,
      keyword: rawQuery.keyword,
      page: rawQuery.page ? parseInt(rawQuery.page) : 1,
      size: rawQuery.size ? parseInt(rawQuery.size) : 10,
      sort: rawQuery.sort || 'latest',
    };
    return this.boardService.findAll(query);
  }

  @Get('api/v1/posts/:id')
  @ApiOperation({
    summary: '공개 게시글 상세 조회',
    description: '공개 상태의 게시글 상세 정보를 조회합니다. (조회수 자동 증가)',
  })
  @ApiParam({ name: 'id', description: '게시글 ID' })
  @ApiResponse({
    status: 200,
    description: '게시글 상세 정보',
    type: PostDetailResponse,
  })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async getPost(@Param('id') id: string): Promise<PostDetailResponse> {
    return this.boardService.findOne(id, false);
  }

  @Get('api/v1/admin/posts')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '관리자 게시글 목록 조회',
    description: '모든 상태의 게시글을 조회할 수 있습니다. (관리자 전용)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: PostStatus,
    description: '게시글 상태 필터 (draft: 임시저장, private: 비공개, public: 공개). 생략 시 전체 상태 조회',
  })
  @ApiQuery({
    name: 'categoryName',
    required: false,
    description: '카테고리명 필터',
  })
  @ApiQuery({
    name: 'keyword',
    required: false,
    description: '제목/내용 검색 키워드',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호 (기본값: 1)',
  })
  @ApiQuery({
    name: 'size',
    required: false,
    description: '페이지 크기 (기본값: 10)',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['latest', 'popular'],
    description: '정렬 방식 (기본값: latest)',
  })
  @ApiResponse({ status: 200, description: '관리자 게시글 목록', type: PagedResponse })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  async getAdminPosts(@Query() rawQuery: any): Promise<PagedResponse<PostResponse>> {
    const query: AdminPostListQuery = {
      status: rawQuery.status,
      categoryName: rawQuery.categoryName,
      keyword: rawQuery.keyword,
      page: rawQuery.page ? parseInt(rawQuery.page) : 1,
      size: rawQuery.size ? parseInt(rawQuery.size) : 10,
      sort: rawQuery.sort || 'latest',
    };
    return this.boardService.findAllForAdmin(query);
  }

  @Get('api/v1/admin/posts/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '관리자 게시글 상세 조회',
    description: '모든 상태의 게시글 상세 정보를 조회할 수 있습니다. (관리자 전용)',
  })
  @ApiParam({ name: 'id', description: '게시글 ID' })
  @ApiResponse({
    status: 200,
    description: '게시글 상세 정보',
    type: PostDetailResponse,
  })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async getAdminPost(@Param('id') id: string): Promise<PostDetailResponse> {
    return this.boardService.findOne(id, true);
  }

  @Post('api/v1/admin/posts')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '게시글 생성',
    description: '새로운 게시글을 생성합니다. 상태를 지정할 수 있습니다. (관리자 전용)',
  })
  @ApiBody({ type: PostCreateRequest })
  @ApiResponse({
    status: 201,
    description: '게시글 생성 완료',
    type: PostDetailResponse,
  })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  async createPost(
    @Body() createDto: PostCreateRequest,
    @Request() req,
  ): Promise<PostDetailResponse> {
    return this.boardService.create(createDto, req.user.id);
  }

  @Put('api/v1/admin/posts/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '게시글 수정',
    description: '기존 게시글을 수정합니다. 임시저장 상태는 수정할 수 없습니다. (관리자 전용)',
  })
  @ApiParam({ name: 'id', description: '게시글 ID' })
  @ApiBody({ type: PostUpdateRequest })
  @ApiResponse({
    status: 200,
    description: '게시글 수정 완료',
    type: PostDetailResponse,
  })
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
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '게시글 삭제',
    description: '게시글을 삭제합니다. (관리자 전용)',
  })
  @ApiParam({ name: 'id', description: '게시글 ID' })
  @ApiResponse({ status: 204, description: '게시글 삭제 완료' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {
    return this.boardService.delete(id);
  }
}
