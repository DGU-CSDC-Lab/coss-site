import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Popup } from '@/popup/entities';
import {
  PopupCreate,
  PopupUpdate,
  PopupResponse,
  PopupQuery,
} from '@/popup/dto/popup.dto';
import { PagedResponse } from '@/common/dto/response.dto';
import { CommonException, PopupException } from '@/common/exceptions';
import { FileService } from '@/file/services/file.service';
import { S3Service } from '@/file/services/s3.service';
import { OwnerType } from '@/file/entities';

/**
 * 팝업 관리 서비스
 *
 * 웹사이트 팝업 공지사항을 관리하는 서비스입니다.
 * - 팝업 목록 조회 (활성화 상태별 필터링 및 페이지네이션 지원)
 * - 현재 활성화된 팝업 조회 (날짜 범위 및 활성화 상태 기준)
 * - 팝업 상세 정보 조회
 * - 팝업 생성, 수정, 삭제 (소프트 삭제)
 * - 우선순위 기반 정렬
 */
@Injectable()
export class PopupService {
  private readonly logger = new Logger(PopupService.name);

  constructor(
    @InjectRepository(Popup) private popupRepository: Repository<Popup>,
    private fileService: FileService,
    private s3Service: S3Service,
  ) {}

  /**
   * 팝업 목록 조회 (관리자용 - 페이지네이션 지원)
   *
   * @param query 검색 및 페이지네이션 조건
   *              - isActive: 활성화 상태 필터 (true/false, 선택사항)
   *              - page: 페이지 번호 (기본값: 1)
   *              - size: 페이지당 항목 수 (기본값: 10)
   * @returns 페이지네이션된 팝업 목록 응답
   */
  async findAll(query: PopupQuery): Promise<PagedResponse<PopupResponse>> {
    const { isActive, page = 1, size = 10 } = query;

    this.logger.log(
      `Finding all popups - isActive: ${isActive !== undefined ? isActive : 'all'}, page: ${page}, size: ${size}`,
    );

    try {
      // QueryBuilder를 사용하여 소프트 삭제된 항목 제외
      const queryBuilder = this.popupRepository
        .createQueryBuilder('popup')
        .where('popup.deletedAt IS NULL'); // 소프트 삭제되지 않은 항목만 조회

      // 활성화 상태 필터 적용 (선택사항)
      if (isActive !== undefined) {
        queryBuilder.andWhere('popup.isActive = :isActive', { isActive });
        this.logger.debug(`Added isActive filter: ${isActive}`);
      }

      // 우선순위 내림차순으로 정렬하고 페이지네이션 적용
      const [popups, totalElements] = await queryBuilder
        .orderBy('popup.priority', 'DESC') // 높은 우선순위가 먼저 표시
        .skip((page - 1) * size) // 페이지네이션: 건너뛸 항목 수
        .take(size) // 페이지네이션: 가져올 항목 수
        .getManyAndCount(); // 데이터와 총 개수를 함께 조회

      this.logger.debug(
        `Found ${popups.length} popups out of ${totalElements} total`,
      );

      // 엔티티를 응답 DTO로 변환하고 페이지네이션 정보와 함께 반환
      const items = popups.map(popup => this.toResponse(popup));
      return new PagedResponse(items, page, size, totalElements);
    } catch (error) {
      this.logger.error('Error finding popups', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 현재 활성화된 팝업 목록 조회 (사용자용)
   *
   * 다음 조건을 모두 만족하는 팝업만 반환:
   * - 소프트 삭제되지 않음 (deletedAt IS NULL)
   * - 활성화 상태 (isActive = true)
   * - 현재 날짜가 시작일과 종료일 사이에 있음
   *
   * @returns 현재 활성화된 팝업 목록 (우선순위 내림차순 정렬)
   */
  async findActive(): Promise<PopupResponse[]> {
    try {
      const now = new Date();
      this.logger.log(
        `Finding active popups for current time: ${now.toISOString()}`,
      );

      // 현재 시점에서 활성화된 팝업 조회
      const popups = await this.popupRepository
        .createQueryBuilder('popup')
        .where('popup.deletedAt IS NULL') // 소프트 삭제되지 않은 항목
        .andWhere('popup.isActive = :active', { active: true }) // 활성화된 항목
        .andWhere('popup.startDate <= :now', { now }) // 시작일이 현재 시점 이전
        .andWhere('popup.endDate >= :now', { now }) // 종료일이 현재 시점 이후
        .orderBy('popup.priority', 'DESC') // 높은 우선순위가 먼저 표시
        .getMany();

      this.logger.debug(`Found ${popups.length} active popups`);

      // 활성화된 팝업들의 제목 로깅 (디버깅용)
      if (popups.length > 0) {
        const titles = popups.map(p => p.title).join(', ');
        this.logger.debug(`Active popup titles: ${titles}`);
      }

      return popups.map(popup => this.toResponse(popup));
    } catch (error) {
      this.logger.error('Error finding active popups', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }
  /**
   * 특정 팝업 상세 정보 조회
   *
   * @param id 조회할 팝업 ID
   * @returns 팝업 상세 정보 응답
   * @throws NotFoundException 해당 ID의 팝업이 존재하지 않는 경우
   */
  async findOne(id: string): Promise<PopupResponse> {
    this.logger.log(`Finding popup by id: ${id}`);
    try {
      // ID로 팝업 조회 (소프트 삭제된 항목도 포함)
      const popup = await this.popupRepository.findOne({ where: { id } });
      if (!popup) {
        this.logger.warn(`Popup not found: ${id}`);
        throw PopupException.popupNotFound(id);
      }

      this.logger.debug(
        `Found popup: ${popup.title} (active: ${popup.isActive})`,
      );
      return this.toResponse(popup);
    } catch (error) {
      this.logger.error(
        `Error finding popup ${id}: ${error.message}`,
        error.stack,
      );
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 새 팝업 생성
   *
   * @param createDto 생성할 팝업 정보
   * @param createdById 생성자 사용자 ID
   * @returns 생성된 팝업 정보 응답
   */
  async create(
    createDto: PopupCreate,
    createdById: string,
  ): Promise<PopupResponse> {
    this.logger.log(
      `Creating popup: ${createDto.title}, creator: ${createdById}`,
    );

    // 날짜 정보 로깅
    this.logger.debug(
      `Popup period: ${createDto.startDate} ~ ${createDto.endDate}`,
    );

    try {
      // 새 팝업 엔티티 생성
      const popup = this.popupRepository.create({
        ...createDto, // 모든 DTO 필드 복사
        startDate: new Date(createDto.startDate), // 문자열을 Date 객체로 변환
        endDate: new Date(createDto.endDate), // 문자열을 Date 객체로 변환
        createdById, // 생성자 ID 설정
      });

      // 데이터베이스에 저장
      const saved = await this.popupRepository.save(popup);
      this.logger.log(
        `Popup created successfully: ${saved.title} (id: ${saved.id})`,
      );

      // temp 파일들을 실제 popup ID로 업데이트
      await this.fileService.updateOwner('temp', saved.id, OwnerType.POPUP);

      return this.toResponse(saved);
    } catch (error) {
      this.logger.error('Error creating popup', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 기존 팝업 정보 수정
   *
   * @param id 수정할 팝업 ID
   * @param updateDto 수정할 정보
   * @returns 수정된 팝업 정보 응답
   * @throws NotFoundException 해당 ID의 팝업이 존재하지 않는 경우
   */
  async update(id: string, updateDto: PopupUpdate): Promise<PopupResponse> {
    this.logger.log(`Updating popup: ${id}`);

    try {
      // 수정할 팝업 존재 여부 확인
      const popup = await this.popupRepository.findOne({ where: { id } });
      if (!popup) {
        this.logger.warn(`Popup not found for update: ${id}`);
        throw PopupException.popupNotFound(id);
      }

      this.logger.debug(`Found popup to update: ${popup.title}`);

      // 변경사항 로깅
      const changes: string[] = [];
      if (updateDto.title && updateDto.title !== popup.title) {
        changes.push(`title: ${popup.title} → ${updateDto.title}`);
      }
      if (
        updateDto.isActive !== undefined &&
        updateDto.isActive !== popup.isActive
      ) {
        changes.push(`isActive: ${popup.isActive} → ${updateDto.isActive}`);
      }
      if (
        updateDto.startDate &&
        new Date(updateDto.startDate).getTime() !== popup.startDate.getTime()
      ) {
        changes.push(
          `startDate: ${popup.startDate.toISOString()} → ${updateDto.startDate}`,
        );
      }
      if (
        updateDto.endDate &&
        new Date(updateDto.endDate).getTime() !== popup.endDate.getTime()
      ) {
        changes.push(
          `endDate: ${popup.endDate.toISOString()} → ${updateDto.endDate}`,
        );
      }

      if (changes.length > 0) {
        this.logger.debug(`Popup changes: ${changes.join(', ')}`);
      }

      // 제공된 필드들로 기존 엔티티 업데이트
      Object.assign(popup, {
        ...updateDto, // 모든 DTO 필드 복사
        // 날짜 필드는 제공된 경우에만 Date 객체로 변환, 아니면 기존값 유지
        startDate: updateDto.startDate
          ? new Date(updateDto.startDate)
          : popup.startDate,
        endDate: updateDto.endDate
          ? new Date(updateDto.endDate)
          : popup.endDate,
      });

      // 변경사항 저장
      const saved = await this.popupRepository.save(popup);
      this.logger.log(
        `Popup updated successfully: ${saved.title} (id: ${saved.id})`,
      );

      return this.toResponse(saved);
    } catch (error) {
      this.logger.error(
        `Error updating popup ${id}: ${error.message}`,
        error.stack,
      );
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 팝업 삭제 (소프트 삭제)
   *
   * 물리적으로 데이터를 삭제하지 않고 deletedAt 필드에 삭제 시간을 기록합니다.
   * 이를 통해 데이터 복구가 가능하고 참조 무결성을 유지할 수 있습니다.
   *
   * @param id 삭제할 팝업 ID
   * @throws NotFoundException 해당 ID의 팝업이 존재하지 않는 경우
   */
  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting popup (soft delete): ${id}`);

    try {
      // 삭제할 팝업 존재 여부 확인
      const popup = await this.popupRepository.findOne({ where: { id } });
      if (!popup) {
        this.logger.warn(`Popup not found for deletion: ${id}`);
        throw PopupException.popupNotFound(id);
      }

      this.logger.debug(`Found popup to delete: ${popup.title}`);

      // 소프트 삭제 실행 (deletedAt 필드에 현재 시간 설정)
      await this.popupRepository.softRemove(popup);

      this.logger.log(
        `Popup soft deleted successfully: ${popup.title} (id: ${id})`,
      );
    } catch (error) {
      this.logger.error(
        `Error deleting popup ${id}: ${error.message}`,
        error.stack,
      );
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * Popup 엔티티를 PopupResponse DTO로 변환
   *
   * @param popup Popup 엔티티
   * @returns PopupResponse DTO
   * @private 내부에서만 사용하는 유틸리티 메서드
   */
  private toResponse(popup: Popup): PopupResponse {
    return {
      id: popup.id,
      title: popup.title, // 팝업 제목
      content: popup.content, // 팝업 내용
      imageUrl: popup.imageUrl ? this.s3Service.getFileUrl(popup.imageUrl) : null, // 팝업 이미지 URL
      linkUrl: popup.linkUrl, // 클릭 시 이동할 링크 URL
      startDate: popup.startDate, // 팝업 시작일
      endDate: popup.endDate, // 팝업 종료일
      createdAt: popup.createdAt, // 팝업 생성일
      isActive: popup.isActive, // 활성화 상태
    };
  }
}
