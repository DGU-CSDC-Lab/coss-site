import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from '@/history/entities';
import {
  HistoryCreate,
  HistoryUpdate,
  HistoryResponse,
  HistoryQuery,
} from '@/history/dto/history.dto';
import { PagedResponse } from '@/common/dto/response.dto';
import { CommonException, HistoryException } from '@/common/exceptions';

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);

  constructor(
    @InjectRepository(History) private historyRepository: Repository<History>,
  ) {}

  /**
   * 연혁 목록 조회
   * - 연도별 필터링 기능 제공
   * - 연도별 정렬 (오름차순/내림차순) 및 월별 오름차순 정렬
   * - 페이지네이션 적용
   * @param query 검색 조건 및 페이지 정보
   * @returns 페이지네이션된 연혁 목록
   */
  async findAll(query: HistoryQuery): Promise<PagedResponse<HistoryResponse>> {
    this.logger.log(`Finding histories with query: ${JSON.stringify(query)}`);
    
    const { sort = 'desc', year, page = 1, size = 10 } = query;

    // 연혁 조회를 위한 쿼리 빌더 생성
    const queryBuilder = this.historyRepository.createQueryBuilder('history');

    // 연도 필터링 조건 추가
    if (year) {
      queryBuilder.where('history.year = :year', { year });
      this.logger.debug(`Filtering by year: ${year}`);
    }

    try {
      // 데이터 조회 및 총 개수 계산
      const [histories, totalElements] = await queryBuilder
        .orderBy('history.year', sort.toUpperCase() as 'ASC' | 'DESC') // 연도별 정렬
        .addOrderBy('history.month', 'ASC') // 월별 오름차순 정렬
        .skip((page - 1) * size) // 페이지네이션 오프셋
        .take(size) // 페이지 크기
        .getManyAndCount();

      this.logger.log(`Found ${histories.length} histories out of ${totalElements} total`);

      // 엔티티를 응답 DTO로 변환
      const items = histories.map(this.toResponse);
      this.logger.log(`Successfully returned ${items.length} histories for page ${page}`);
      
      return new PagedResponse(items, page, size, totalElements);
    } catch (error) {
      this.logger.error(`Failed to find histories: ${error.message}`, error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 연혁 상세 조회
   * - ID로 특정 연혁 정보 조회
   * @param id 연혁 ID
   * @returns 연혁 상세 정보
   * @throws NotFoundException 연혁을 찾을 수 없는 경우
   */
  async findOne(id: string): Promise<HistoryResponse> {
    this.logger.log(`Finding history by id: ${id}`);
    
    try {
      const history = await this.historyRepository.findOne({ where: { id } });
      
      if (!history) {
        this.logger.warn(`History not found: ${id}`);
        throw HistoryException.historyNotFound(id);
      }

      this.logger.log(`Found history: ${history.title} (${history.year}.${history.month})`);
      return this.toResponse(history);
    } catch (error) {
      this.logger.error(`Failed to find history ${id}: ${error.message}`, error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 새 연혁 생성
   * - 연도, 월, 제목, 설명 정보로 새로운 연혁 생성
   * @param createDto 연혁 생성 데이터
   * @returns 생성된 연혁 정보
   */
  async create(createDto: HistoryCreate): Promise<HistoryResponse> {
    this.logger.log(`Creating new history: ${createDto.title} (${createDto.year}.${createDto.month})`);
    
    try {
      // 새 연혁 엔티티 생성
      const history = this.historyRepository.create({
        year: createDto.year,
        month: createDto.month,
        title: createDto.title,
        description: createDto.description,
      });

      // 데이터베이스에 저장
      const saved = await this.historyRepository.save(history);
      this.logger.log(`History created successfully: ${saved.id} - ${saved.title}`);
      
      return this.toResponse(saved);
    } catch (error) {
      this.logger.error(`Failed to create history: ${error.message}`, error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 연혁 정보 수정
   * - 기존 연혁 존재 여부 확인 후 수정
   * - 제공된 필드만 업데이트 (부분 업데이트)
   * @param id 수정할 연혁 ID
   * @param updateDto 수정할 데이터
   * @returns 수정된 연혁 정보
   * @throws NotFoundException 연혁을 찾을 수 없는 경우
   */
  async update(id: string, updateDto: HistoryUpdate): Promise<HistoryResponse> {
    this.logger.log(`Updating history: ${id}`);
    
    try {
      // 기존 연혁 조회
      const history = await this.historyRepository.findOne({ where: { id } });
      
      if (!history) {
        this.logger.warn(`History not found for update: ${id}`);
        throw HistoryException.historyNotFound(id);
      }

      this.logger.debug(`Found history to update: ${history.title}`);

      // 제공된 필드만 업데이트 (null 병합 연산자 사용)
      Object.assign(history, {
        year: updateDto.year ?? history.year,
        month: updateDto.month ?? history.month,
        title: updateDto.title ?? history.title,
        description: updateDto.description ?? history.description,
      });

      // 변경사항 저장
      const saved = await this.historyRepository.save(history);
      this.logger.log(`History updated successfully: ${saved.id} - ${saved.title}`);
      
      return this.toResponse(saved);
    } catch (error) {
      this.logger.error(`Failed to update history ${id}: ${error.message}`, error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 연혁 삭제 (물리적 삭제)
   * - 연혁 존재 여부 확인 후 완전 삭제
   * @param id 삭제할 연혁 ID
   * @throws NotFoundException 연혁을 찾을 수 없는 경우
   */
  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting history: ${id}`);
    
    try {
      // 삭제할 연혁 조회
      const history = await this.historyRepository.findOne({ where: { id } });
      
      if (!history) {
        this.logger.warn(`History not found for deletion: ${id}`);
        throw HistoryException.historyNotFound(id);
      }

      this.logger.debug(`Found history to delete: ${history.title}`);
      
      // 소프트 삭제 실행
      await this.historyRepository.softRemove(history);
      this.logger.log(`History deleted successfully: ${id} - ${history.title}`);
    } catch (error) {
      this.logger.error(`Failed to delete history ${id}: ${error.message}`, error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 연혁 엔티티를 응답 DTO로 변환
   * - 클라이언트에게 반환할 형태로 데이터 변환
   * @param history 연혁 엔티티
   * @returns 연혁 응답 DTO
   */
  private toResponse(history: History): HistoryResponse {
    return {
      id: history.id,
      year: history.year,
      month: history.month,
      title: history.title,
      description: history.description,
    };
  }
}
