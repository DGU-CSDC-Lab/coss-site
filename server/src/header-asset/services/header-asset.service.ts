import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeaderAsset } from '@/header-asset/entities';
import {
  HeaderAssetCreate,
  HeaderAssetUpdate,
  HeaderAssetResponse,
  HeaderAssetQuery,
} from '@/header-asset/dto/header-asset.dto';
import { PagedResponse } from '@/common/dto/response.dto';
import { CommonException, HeaderAssetException } from '@/common/exceptions';
import { FileService } from '@/file/services/file.service';
import { S3Service } from '@/file/services/s3.service';
import { OwnerType } from '@/file/entities';

/**
 * 헤더 에셋 관리 서비스
 *
 * 웹사이트 헤더 영역에 표시되는 배너/슬라이드 이미지를 관리하는 서비스입니다.
 * - 헤더 에셋 목록 조회 (활성화 상태별 필터링 및 페이지네이션 지원)
 * - 헤더 에셋 상세 정보 조회
 * - 헤더 에셋 생성, 수정, 삭제 (소프트 삭제)
 * - 이미지 URL과 링크 URL 관리
 * - 활성화/비활성화 상태 관리
 */
@Injectable()
export class HeaderAssetService {
  private readonly logger = new Logger(HeaderAssetService.name);

  constructor(
    @InjectRepository(HeaderAsset)
    private headerAssetRepository: Repository<HeaderAsset>,
    private fileService: FileService,
    private s3Service: S3Service,
  ) {}

  /**
   * 헤더 에셋 목록 조회 (페이지네이션 및 필터링 지원)
   *
   * @param query 검색 및 페이지네이션 조건
   *              - isActive: 활성화 상태 필터 (true/false, 선택사항)
   *              - page: 페이지 번호 (기본값: 1)
   *              - size: 페이지당 항목 수 (기본값: 10)
   * @returns 페이지네이션된 헤더 에셋 목록 응답
   */
  async findAll(
    query: HeaderAssetQuery,
  ): Promise<PagedResponse<HeaderAssetResponse>> {
    const { isActive, page = 1, size = 10 } = query;

    this.logger.log(
      `Finding header assets - isActive: ${isActive !== undefined ? isActive : 'all'}, page: ${page}, size: ${size}`,
    );

    try {
      // QueryBuilder를 사용하여 소프트 삭제된 항목 제외
      const queryBuilder = this.headerAssetRepository
        .createQueryBuilder('asset')
        .where('asset.deletedAt IS NULL'); // 소프트 삭제되지 않은 항목만 조회

      // 활성화 상태 필터 적용 (선택사항)
      if (isActive !== undefined) {
        queryBuilder.andWhere('asset.isActive = :isActive', { isActive });
        this.logger.debug(`Added isActive filter: ${isActive}`);
      }

      // 최신 생성일 기준 내림차순으로 정렬하고 페이지네이션 적용
      const [assets, totalElements] = await queryBuilder
        .orderBy('asset.createdAt', 'DESC') // 최신 항목이 먼저 표시
        .skip((page - 1) * size) // 페이지네이션: 건너뛸 항목 수
        .take(size) // 페이지네이션: 가져올 항목 수
        .getManyAndCount(); // 데이터와 총 개수를 함께 조회

      this.logger.debug(
        `Found ${assets.length} header assets out of ${totalElements} total`,
      );

      // 엔티티를 응답 DTO로 변환하고 페이지네이션 정보와 함께 반환
      const items = assets.map(asset => this.toResponse(asset));
      return new PagedResponse(items, page, size, totalElements);
    } catch (error) {
      this.logger.error('Error finding header assets', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 특정 헤더 에셋 상세 정보 조회
   *
   * @param id 조회할 헤더 에셋 ID
   * @returns 헤더 에셋 상세 정보 응답
   * @throws NotFoundException 해당 ID의 헤더 에셋이 존재하지 않거나 삭제된 경우
   */
  async findOne(id: string): Promise<HeaderAssetResponse> {
    this.logger.log(`Finding header asset by id: ${id}`);

    try {
      // ID로 헤더 에셋 조회 (소프트 삭제된 항목 제외)
      const asset = await this.headerAssetRepository.findOne({
        where: { id, deletedAt: null }, // 삭제되지 않은 항목만 조회
      });

      if (!asset) {
        this.logger.warn(`Header asset not found: ${id}`);
        throw HeaderAssetException.headerAssetNotFound(id);
      }

      this.logger.debug(
        `Found header asset: ${asset.title} (active: ${asset.isActive})`,
      );
      return this.toResponse(asset);
    } catch (error) {
      this.logger.error(
        `Error finding header asset ${id}: ${error.message}`,
        error.stack,
      );
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 새 헤더 에셋 생성
   *
   * @param createDto 생성할 헤더 에셋 정보
   * @param createdById 생성자 사용자 ID
   * @returns 생성된 헤더 에셋 정보 응답
   */
  async create(
    createDto: HeaderAssetCreate,
    createdById: string,
  ): Promise<HeaderAssetResponse> {
    this.logger.log(
      `Creating header asset: ${createDto.title}, creator: ${createdById}`,
    );

    // 에셋 정보 로깅
    this.logger.debug(
      `Asset details - imageUrl: ${createDto.imageUrl}, linkUrl: ${createDto.linkUrl || 'none'}, isActive: ${createDto.isActive}`,
    );

    try {
      // 새 헤더 에셋 엔티티 생성
      const asset = this.headerAssetRepository.create({
        ...createDto, // 모든 DTO 필드 복사
        createdById, // 생성자 ID 설정
      });

      this.logger.debug(`Created header asset entity with id: ${asset.id}`);

      // 데이터베이스에 저장
      const saved = await this.headerAssetRepository.save(asset);
      this.logger.log(
        `Header asset created successfully: ${saved.title} (id: ${saved.id})`,
      );

      // temp 파일들을 실제 header-asset ID로 업데이트
      await this.fileService.updateOwner('temp', saved.id, OwnerType.HEADER);

      return this.toResponse(saved);
    } catch (error) {
      this.logger.error('Error creating header asset', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 기존 헤더 에셋 정보 수정
   *
   * @param id 수정할 헤더 에셋 ID
   * @param updateDto 수정할 정보
   * @returns 수정된 헤더 에셋 정보 응답
   * @throws NotFoundException 해당 ID의 헤더 에셋이 존재하지 않거나 삭제된 경우
   */
  async update(
    id: string,
    updateDto: HeaderAssetUpdate,
  ): Promise<HeaderAssetResponse> {
    this.logger.log(`Updating header asset: ${id}`);

    try {
      // 수정할 헤더 에셋 존재 여부 확인 (소프트 삭제된 항목 제외)
      const asset = await this.headerAssetRepository.findOne({
        where: { id, deletedAt: null },
      });

      if (!asset) {
        this.logger.warn(`Header asset not found for update: ${id}`);
        throw HeaderAssetException.headerAssetNotFound(id);
      }

      this.logger.debug(`Found header asset to update: ${asset.title}`);

      // 변경사항 로깅
      const changes: string[] = [];
      if (updateDto.title && updateDto.title !== asset.title) {
        changes.push(`title: ${asset.title} → ${updateDto.title}`);
      }
      if (updateDto.imageUrl && updateDto.imageUrl !== asset.imageUrl) {
        changes.push(`imageUrl: ${asset.imageUrl} → ${updateDto.imageUrl}`);
      }
      if (
        updateDto.linkUrl !== undefined &&
        updateDto.linkUrl !== asset.linkUrl
      ) {
        changes.push(
          `linkUrl: ${asset.linkUrl || 'none'} → ${updateDto.linkUrl || 'none'}`,
        );
      }
      if (
        updateDto.isActive !== undefined &&
        updateDto.isActive !== asset.isActive
      ) {
        changes.push(`isActive: ${asset.isActive} → ${updateDto.isActive}`);
      }

      if (changes.length > 0) {
        this.logger.debug(`Header asset changes: ${changes.join(', ')}`);
      }

      // 제공된 필드들로 기존 엔티티 업데이트
      Object.assign(asset, updateDto);

      // 변경사항 저장
      const saved = await this.headerAssetRepository.save(asset);
      this.logger.log(
        `Header asset updated successfully: ${saved.title} (id: ${saved.id})`,
      );

      return this.toResponse(saved);
    } catch (error) {
      this.logger.error(
        `Error updating header asset ${id}: ${error.message}`,
        error.stack,
      );
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 헤더 에셋 삭제 (소프트 삭제)
   *
   * 물리적으로 데이터를 삭제하지 않고 deletedAt 필드에 삭제 시간을 기록합니다.
   * 이를 통해 데이터 복구가 가능하고 참조 무결성을 유지할 수 있습니다.
   *
   * @param id 삭제할 헤더 에셋 ID
   * @throws NotFoundException 해당 ID의 헤더 에셋이 존재하지 않거나 이미 삭제된 경우
   */
  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting header asset (soft delete): ${id}`);

    try {
      // 삭제할 헤더 에셋 존재 여부 확인 (소프트 삭제된 항목 제외)
      const asset = await this.headerAssetRepository.findOne({
        where: { id, deletedAt: null },
      });

      if (!asset) {
        this.logger.warn(`Header asset not found for deletion: ${id}`);
        throw HeaderAssetException.headerAssetNotFound(id);
      }

      this.logger.debug(`Found header asset to delete: ${asset.title}`);

      // 소프트 삭제 실행 (deletedAt 필드에 현재 시간 설정)
      await this.headerAssetRepository.softRemove(asset);

      this.logger.log(
        `Header asset soft deleted successfully: ${asset.title} (id: ${id})`,
      );
    } catch (error) {
      this.logger.error(
        `Error deleting header asset ${id}: ${error.message}`,
        error.stack,
      );
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * HeaderAsset 엔티티를 HeaderAssetResponse DTO로 변환
   *
   * @param asset HeaderAsset 엔티티
   * @returns HeaderAssetResponse DTO
   * @private 내부에서만 사용하는 유틸리티 메서드
   */
  private toResponse(asset: HeaderAsset): HeaderAssetResponse {
    return {
      id: asset.id,
      title: asset.title, // 헤더 에셋 제목
      imageUrl: asset.imageUrl ? this.s3Service.getFileUrl(asset.imageUrl) : null, // CloudFront URL로 변환
      linkUrl: asset.linkUrl, // 클릭 시 이동할 링크 URL (선택사항)
      isActive: asset.isActive, // 활성화 상태
    };
  }
}
