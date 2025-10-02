import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Popup } from '../entities';
import { PopupCreate, PopupUpdate, PopupResponse, PopupQuery } from '../dto/popup.dto';
import { PagedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class PopupService {
  constructor(@InjectRepository(Popup) private popupRepository: Repository<Popup>) {}

  async findAll(query: PopupQuery): Promise<PagedResponse<PopupResponse>> {
    const { isActive, page = 1, size = 10 } = query;
    
    const queryBuilder = this.popupRepository.createQueryBuilder('popup')
      .where('popup.deletedAt IS NULL');
    
    if (isActive !== undefined) {
      queryBuilder.andWhere('popup.isActive = :isActive', { isActive });
    }

    const [popups, totalElements] = await queryBuilder
      .orderBy('popup.priority', 'DESC')
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    const items = popups.map(this.toResponse);
    return new PagedResponse(items, page, size, totalElements);
  }

  async findActive(): Promise<PopupResponse[]> {
    const now = new Date();
    const popups = await this.popupRepository.createQueryBuilder('popup')
      .where('popup.deletedAt IS NULL')
      .andWhere('popup.isActive = :active', { active: true })
      .andWhere('popup.startDate <= :now', { now })
      .andWhere('popup.endDate >= :now', { now })
      .orderBy('popup.priority', 'DESC')
      .getMany();
    
    return popups.map(this.toResponse);
  }

  async findOne(id: string): Promise<PopupResponse> {
    const popup = await this.popupRepository.findOne({ where: { id } });
    if (!popup) throw new NotFoundException('Popup not found');
    return this.toResponse(popup);
  }

  async create(createDto: PopupCreate, createdById: string): Promise<PopupResponse> {
    const popup = this.popupRepository.create({
      ...createDto,
      startDate: new Date(createDto.startDate),
      endDate: new Date(createDto.endDate),
      createdById,
    });
    const saved = await this.popupRepository.save(popup);
    return this.toResponse(saved);
  }

  async update(id: string, updateDto: PopupUpdate): Promise<PopupResponse> {
    const popup = await this.popupRepository.findOne({ where: { id } });
    if (!popup) throw new NotFoundException('Popup not found');
    
    Object.assign(popup, {
      ...updateDto,
      startDate: updateDto.startDate ? new Date(updateDto.startDate) : popup.startDate,
      endDate: updateDto.endDate ? new Date(updateDto.endDate) : popup.endDate,
    });

    const saved = await this.popupRepository.save(popup);
    return this.toResponse(saved);
  }

  async delete(id: string): Promise<void> {
    const popup = await this.popupRepository.findOne({ where: { id } });
    if (!popup) throw new NotFoundException('Popup not found');
    await this.popupRepository.softRemove(popup);
  }

  private toResponse(popup: Popup): PopupResponse {
    return {
      id: popup.id,
      title: popup.title,
      content: popup.content,
      imageUrl: popup.imageUrl,
      linkUrl: popup.linkUrl,
      startDate: popup.startDate,
      endDate: popup.endDate,
      isActive: popup.isActive,
      createdAt: popup.createdAt,
      updatedAt: popup.updatedAt,
    };
  }
}
