import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeaderAsset } from '../entities';
import {
  HeaderAssetCreate,
  HeaderAssetUpdate,
  HeaderAssetResponse,
  HeaderAssetQuery,
} from '../dto/header-asset.dto';
import { PagedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class HeaderAssetService {
  constructor(
    @InjectRepository(HeaderAsset)
    private headerAssetRepository: Repository<HeaderAsset>,
  ) {}

  async findAll(
    query: HeaderAssetQuery,
  ): Promise<PagedResponse<HeaderAssetResponse>> {
    const { isActive, page = 1, size = 10 } = query;

    const queryBuilder = this.headerAssetRepository
      .createQueryBuilder('asset')
      .where('asset.deletedAt IS NULL');

    if (isActive !== undefined) {
      queryBuilder.andWhere('asset.isActive = :isActive', { isActive });
    }

    const [assets, totalElements] = await queryBuilder
      .orderBy('asset.createdAt', 'DESC')
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    const items = assets.map(this.toResponse);
    return new PagedResponse(items, page, size, totalElements);
  }

  async findOne(id: string): Promise<HeaderAssetResponse> {
    const asset = await this.headerAssetRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!asset) {
      throw new NotFoundException('Header asset not found');
    }

    return this.toResponse(asset);
  }

  async create(
    createDto: HeaderAssetCreate,
    createdById: string,
  ): Promise<HeaderAssetResponse> {
    console.log('Creating header asset with createdById:', createdById);
    console.log('CreateDto:', createDto);
    
    const asset = this.headerAssetRepository.create({
      ...createDto,
      createdById,
    });

    console.log('Created asset entity:', asset);

    const saved = await this.headerAssetRepository.save(asset);
    return this.toResponse(saved);
  }

  async update(
    id: string,
    updateDto: HeaderAssetUpdate,
  ): Promise<HeaderAssetResponse> {
    const asset = await this.headerAssetRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!asset) {
      throw new NotFoundException('Header asset not found');
    }

    Object.assign(asset, updateDto);

    const saved = await this.headerAssetRepository.save(asset);
    return this.toResponse(saved);
  }

  async delete(id: string): Promise<void> {
    const asset = await this.headerAssetRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!asset) {
      throw new NotFoundException('Header asset not found');
    }

    await this.headerAssetRepository.softRemove(asset);
  }

  private toResponse(asset: HeaderAsset): HeaderAssetResponse {
    return {
      id: asset.id,
      title: asset.title,
      imageUrl: asset.imageUrl,
      linkUrl: asset.linkUrl,
      isActive: asset.isActive,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    };
  }
}
