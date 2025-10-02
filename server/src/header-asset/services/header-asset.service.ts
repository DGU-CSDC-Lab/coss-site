import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeaderAsset, HeaderAssetType } from '../entities';
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
    const { type, isActive, page = 1, size = 10 } = query;

    const queryBuilder = this.headerAssetRepository
      .createQueryBuilder('asset')
      .where('asset.deletedAt IS NULL');

    if (type) {
      queryBuilder.andWhere('asset.type = :type', { type });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('asset.isActive = :isActive', { isActive });
    }

    // 현재 시간 기준으로 유효한 것만 (기간이 설정된 경우)
    const now = new Date();
    queryBuilder.andWhere(
      '(asset.startDate IS NULL OR asset.startDate <= :now) AND (asset.endDate IS NULL OR asset.endDate >= :now)',
      { now },
    );

    const [assets, totalElements] = await queryBuilder
      .orderBy('asset.displayOrder', 'ASC')
      .addOrderBy('asset.createdAt', 'DESC')
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    const items = assets.map(this.toResponse);
    return new PagedResponse(items, page, size, totalElements);
  }

  async findByType(type: HeaderAssetType): Promise<HeaderAssetResponse[]> {
    const now = new Date();
    const assets = await this.headerAssetRepository
      .createQueryBuilder('asset')
      .where('asset.deletedAt IS NULL')
      .andWhere('asset.type = :type', { type })
      .andWhere('asset.isActive = :isActive', { isActive: true })
      .andWhere(
        '(asset.startDate IS NULL OR asset.startDate <= :now) AND (asset.endDate IS NULL OR asset.endDate >= :now)',
        { now },
      )
      .orderBy('asset.displayOrder', 'ASC')
      .getMany();

    return assets.map(this.toResponse);
  }

  async findOne(id: string): Promise<HeaderAssetResponse> {
    const asset = await this.headerAssetRepository.findOne({ where: { id } });
    if (!asset) {
      throw new NotFoundException('Header asset not found');
    }
    return this.toResponse(asset);
  }

  async create(
    createDto: HeaderAssetCreate,
    createdById: string,
  ): Promise<HeaderAssetResponse> {
    const asset = this.headerAssetRepository.create({
      ...createDto,
      startDate: createDto.startDate
        ? new Date(createDto.startDate)
        : undefined,
      endDate: createDto.endDate ? new Date(createDto.endDate) : undefined,
      createdById,
    });

    const saved = await this.headerAssetRepository.save(asset);
    return this.toResponse(saved);
  }

  async update(
    id: string,
    updateDto: HeaderAssetUpdate,
  ): Promise<HeaderAssetResponse> {
    const asset = await this.headerAssetRepository.findOne({ where: { id } });
    if (!asset) {
      throw new NotFoundException('Header asset not found');
    }

    Object.assign(asset, {
      ...updateDto,
      startDate: updateDto.startDate
        ? new Date(updateDto.startDate)
        : asset.startDate,
      endDate: updateDto.endDate ? new Date(updateDto.endDate) : asset.endDate,
    });

    const saved = await this.headerAssetRepository.save(asset);
    return this.toResponse(saved);
  }

  async delete(id: string): Promise<void> {
    const asset = await this.headerAssetRepository.findOne({ where: { id } });
    if (!asset) {
      throw new NotFoundException('Header asset not found');
    }
    await this.headerAssetRepository.softRemove(asset);
  }

  private toResponse(asset: HeaderAsset): HeaderAssetResponse {
    return {
      id: asset.id,
      type: asset.type,
      title: asset.title,
      imageUrl: asset.imageUrl,
      linkUrl: asset.linkUrl,
      textContent: asset.textContent,
      isActive: asset.isActive,
      displayOrder: asset.displayOrder,
      startDate: asset.startDate,
      endDate: asset.endDate,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    };
  }
}
