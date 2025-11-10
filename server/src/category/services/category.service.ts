import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from '@/category/entities';
import {
  CategoryCreate,
  CategoryUpdate,
  CategoryResponse,
} from '@/category/dto/category.dto';
import { CategoryException, CommonException } from '@/common/exceptions';

/**
 * 카테고리 서비스
 *
 * 계층형 카테고리 구조를 관리하는 서비스입니다.
 * - 부모-자식 관계를 가진 카테고리 트리 구조 지원
 * - 카테고리별 표시 순서(displayOrder) 관리
 * - 자동 slug 생성 (엔티티에서 처리)
 * - 하위 카테고리가 있는 경우 삭제 방지
 */
@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  /**
   * 카테고리 목록 조회
   *
   * @param parentId 부모 카테고리 ID (선택사항)
   *                 - 제공되면: 해당 부모의 하위 카테고리들만 조회
   *                 - 제공되지 않으면: 최상위 카테고리들만 조회 (parentId가 null인 것들)
   * @returns 카테고리 응답 배열 (displayOrder, createdAt 순으로 정렬)
   */
  async findAll(parentId?: string): Promise<CategoryResponse[]> {
    try {
      this.logger.log(
        `Finding categories with parentId: ${parentId || 'null (root categories)'}`,
      );

      // 부모 ID에 따라 조건부 쿼리 실행
      const categories = await this.categoryRepository.find({
        where: parentId ? { parentId } : { parentId: null }, // 부모 ID 조건
        order: { order: 'ASC', createdAt: 'ASC' }, // 표시 순서 우선, 생성일 보조 정렬
        select: ['id', 'name', 'slug', 'parentId', 'order', 'createdAt'], // 필요한 필드만 선택
      });

      this.logger.debug(
        `Found ${categories.length} categories for parentId: ${parentId || 'null'}`,
      );

      // 엔티티를 응답 DTO로 변환하여 반환
      return categories.map(this.toResponse);
    } catch (error) {
      this.logger.error('Error finding categories', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 새 카테고리 생성
   *
   * @param createDto 카테고리 생성 데이터
   * @returns 생성된 카테고리 응답
   * @throws NotFoundException 부모 카테고리가 존재하지 않는 경우
   */
  async create(createDto: CategoryCreate): Promise<CategoryResponse> {
    try {
      this.logger.log(
        `Creating category: ${createDto.name}, parentId: ${createDto.parentId || 'null'}`,
      );

      // 부모 카테고리가 지정된 경우 존재 여부 확인
      if (createDto.parentId) {
        this.logger.debug(
          `Checking parent category existence: ${createDto.parentId}`,
        );
        const parent = await this.categoryRepository.findOne({
          where: { id: createDto.parentId },
        });
        if (!parent) {
          this.logger.warn(`Parent category not found: ${createDto.parentId}`);
          throw CategoryException.parentCategoryNotFound(createDto.parentId);
        }
        this.logger.debug(`Parent category found: ${parent.name}`);
      }

      // 새 카테고리 엔티티 생성
      const category = this.categoryRepository.create({
        name: createDto.name,
        parentId: createDto.parentId, // null일 수 있음 (최상위 카테고리)
        order: createDto.order || 0, // 기본값 0
      });

      // 데이터베이스에 저장 (slug는 엔티티의 @BeforeInsert에서 자동 생성)
      const saved = await this.categoryRepository.save(category);
      this.logger.log(
        `Category created successfully: ${saved.name} (id: ${saved.id}, slug: ${saved.slug})`,
      );

      return this.toResponse(saved);
    } catch (error) {
      this.logger.error('Error creating category', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 기존 카테고리 수정
   *
   * @param id 수정할 카테고리 ID
   * @param updateDto 수정할 데이터
   * @returns 수정된 카테고리 응답
   * @throws NotFoundException 카테고리 또는 새 부모 카테고리가 존재하지 않는 경우
   */
  async update(
    id: string,
    updateDto: CategoryUpdate,
  ): Promise<CategoryResponse> {
    try {
      this.logger.log(`Updating category: ${id}`);
      // 수정할 카테고리 존재 여부 확인
      const category = await this.categoryRepository.findOne({ where: { id } });
      if (!category) {
        this.logger.warn(`Category not found for update: ${id}`);
        throw CategoryException.categoryNotFound(id);
      }

      this.logger.debug(`Found category to update: ${category.name}`);

      // 부모 카테고리가 변경되는 경우 새 부모의 존재 여부 확인
      if (updateDto.parentId && updateDto.parentId !== category.parentId) {
        this.logger.debug(
          `Checking new parent category: ${updateDto.parentId}`,
        );
        const parent = await this.categoryRepository.findOne({
          where: { id: updateDto.parentId },
        });
        if (!parent) {
          this.logger.warn(
            `New parent category not found: ${updateDto.parentId}`,
          );
          throw CategoryException.parentCategoryNotFound(updateDto.parentId);
        }
        this.logger.debug(`New parent category found: ${parent.name}`);
      }

      // 변경사항 로깅
      const changes: string[] = [];
      if (updateDto.name && updateDto.name !== category.name) {
        changes.push(`name: ${category.name} → ${updateDto.name}`);
      }
      if (
        updateDto.parentId !== undefined &&
        updateDto.parentId !== category.parentId
      ) {
        changes.push(`parentId: ${category.parentId} → ${updateDto.parentId}`);
      }
      if (updateDto.order !== undefined && updateDto.order !== category.order) {
        changes.push(`order: ${category.order} → ${updateDto.order}`);
      }

      if (changes.length > 0) {
        this.logger.debug(`Category changes: ${changes.join(', ')}`);
      }

      // 제공된 필드만 업데이트 (null 병합 연산자 사용)
      Object.assign(category, {
        name: updateDto.name ?? category.name,
        parentId: updateDto.parentId ?? category.parentId,
        order: updateDto.order ?? category.order,
      });

      // 변경사항 저장 (slug는 엔티티의 @BeforeUpdate에서 자동 갱신)
      const saved = await this.categoryRepository.save(category);
      this.logger.log(
        `Category updated successfully: ${saved.name} (id: ${saved.id})`,
      );

      return this.toResponse(saved);
    } catch (error) {
      this.logger.error(`Error updating category: ${id}`, error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 카테고리 삭제
   *
   * @param id 삭제할 카테고리 ID
   * @throws NotFoundException 카테고리가 존재하지 않는 경우
   * @throws ConflictException 하위 카테고리가 존재하여 삭제할 수 없는 경우
   */
  async delete(id: string): Promise<void> {
    try {
      this.logger.log(`Deleting category: ${id}`);

      // 삭제할 카테고리와 하위 카테고리들을 함께 조회
      const category = await this.categoryRepository.findOne({
        where: { id },
        relations: ['children'], // 하위 카테고리 관계 로드
      });

      if (!category) {
        this.logger.warn(`Category not found for deletion: ${id}`);
        throw CategoryException.categoryNotFound(id);
      }

      this.logger.debug(`Found category to delete: ${category.name}`);

      // 하위 카테고리가 존재하는 경우 삭제 방지
      // 데이터 무결성 보장을 위해 하위 카테고리를 먼저 삭제하거나 이동해야 함
      if (category.children && category.children.length > 0) {
        this.logger.warn(
          `Cannot delete category with ${category.children.length} subcategories: ${category.name}`,
        );
        throw CategoryException.isExistingSubcategory();
      }

      // 하위 카테고리가 없는 경우에만 소프트 삭제 실행
      await this.categoryRepository.softRemove(category);
      this.logger.log(
        `Category deleted successfully: ${category.name} (id: ${id})`,
      );
    } catch (error) {
      this.logger.error(`Error deleting category: ${id}`, error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * Category 엔티티를 CategoryResponse DTO로 변환
   *
   * @param category Category 엔티티
   * @returns CategoryResponse DTO
   * @private 내부에서만 사용하는 유틸리티 메서드
   */
  private toResponse(category: Category): CategoryResponse {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug, // URL에서 사용할 수 있는 형태로 변환된 이름
      parentId: category.parentId, // null이면 최상위 카테고리
      order: category.order, // 표시 순서
      createdAt: category.createdAt,
    };
  }
}
