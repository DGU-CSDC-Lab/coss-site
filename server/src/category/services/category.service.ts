import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities';
import { CategoryCreate, CategoryUpdate, CategoryResponse } from '../dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(parentId?: string): Promise<CategoryResponse[]> {
    const categories = await this.categoryRepository.find({
      where: parentId ? { parentId } : { parentId: null },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });

    return categories.map(this.toResponse);
  }

  async create(createDto: CategoryCreate): Promise<CategoryResponse> {
    if (createDto.parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: createDto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = this.categoryRepository.create({
      name: createDto.name,
      parentId: createDto.parentId,
      displayOrder: createDto.order || 0,
    });

    const saved = await this.categoryRepository.save(category);
    return this.toResponse(saved);
  }

  async update(id: string, updateDto: CategoryUpdate): Promise<CategoryResponse> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (updateDto.parentId && updateDto.parentId !== category.parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: updateDto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    Object.assign(category, {
      name: updateDto.name ?? category.name,
      parentId: updateDto.parentId ?? category.parentId,
      displayOrder: updateDto.order ?? category.displayOrder,
    });

    const saved = await this.categoryRepository.save(category);
    return this.toResponse(saved);
  }

  async delete(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.children && category.children.length > 0) {
      throw new ConflictException('Cannot delete category with subcategories');
    }

    await this.categoryRepository.remove(category);
  }

  private toResponse(category: Category): CategoryResponse {
    return {
      id: category.id,
      name: category.name,
      parentId: category.parentId,
      order: category.displayOrder,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
