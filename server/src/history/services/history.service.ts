import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from '../entities';
import { HistoryCreate, HistoryUpdate, HistoryResponse, HistoryQuery } from '../dto/history.dto';
import { PagedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class HistoryService {
  constructor(@InjectRepository(History) private historyRepository: Repository<History>) {}

  async findAll(query: HistoryQuery): Promise<PagedResponse<HistoryResponse>> {
    const { sort = 'desc', year, page = 1, size = 10 } = query;
    
    const queryBuilder = this.historyRepository.createQueryBuilder('history');
    
    if (year) {
      queryBuilder.where('history.year = :year', { year });
    }

    const [histories, totalElements] = await queryBuilder
      .orderBy('history.year', sort.toUpperCase() as 'ASC' | 'DESC')
      .addOrderBy('history.month', 'ASC')
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    const items = histories.map(this.toResponse);
    return new PagedResponse(items, page, size, totalElements);
  }

  async findOne(id: string): Promise<HistoryResponse> {
    const history = await this.historyRepository.findOne({ where: { id } });
    if (!history) throw new NotFoundException('History not found');
    return this.toResponse(history);
  }

  async create(createDto: HistoryCreate): Promise<HistoryResponse> {
    const history = this.historyRepository.create({
      year: createDto.year,
      month: createDto.month,
      title: createDto.title,
      description: createDto.description,
      event: createDto.description, // Use description as event for backward compatibility
    });

    const saved = await this.historyRepository.save(history);
    return this.toResponse(saved);
  }

  async update(id: string, updateDto: HistoryUpdate): Promise<HistoryResponse> {
    const history = await this.historyRepository.findOne({ where: { id } });
    if (!history) throw new NotFoundException('History not found');
    
    Object.assign(history, {
      year: updateDto.year ?? history.year,
      month: updateDto.month ?? history.month,
      title: updateDto.title ?? history.title,
      description: updateDto.description ?? history.description,
      event: updateDto.description ?? history.event,
    });

    const saved = await this.historyRepository.save(history);
    return this.toResponse(saved);
  }

  async delete(id: string): Promise<void> {
    const history = await this.historyRepository.findOne({ where: { id } });
    if (!history) throw new NotFoundException('History not found');
    await this.historyRepository.remove(history);
  }

  private toResponse(history: History): HistoryResponse {
    return {
      id: history.id,
      year: history.year,
      month: history.month,
      title: history.title,
      description: history.description,
      createdAt: history.createdAt,
      updatedAt: history.updatedAt,
    };
  }
}
