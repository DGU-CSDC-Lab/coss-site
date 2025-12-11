import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacultyMember } from '@/faculty/entities';
import {
  FacultyCreate,
  FacultyUpdate,
  FacultyResponse,
  FacultyQuery,
} from '@/faculty/dto/faculty.dto';
import { PagedResponse } from '@/common/dto/response.dto';
import { CommonException, FacultyException } from '@/common/exceptions';
import { FileService } from '@/file/services/file.service';
import { S3Service } from '@/file/services/s3.service';
import { OwnerType } from '@/file/entities';

/**
 * 교수진 관리 서비스
 *
 * 지능IoT학과 교수진 정보를 관리하는 서비스입니다.
 * - 교수진 목록 조회 (이름, 학과별 검색 및 페이지네이션 지원)
 * - 교수진 상세 정보 조회
 * - 교수진 정보 생성, 수정, 삭제
 * - 이메일 중복 검사를 통한 데이터 무결성 보장
 */
@Injectable()
export class FacultyService {
  private readonly logger = new Logger(FacultyService.name);

  constructor(
    @InjectRepository(FacultyMember)
    private facultyRepository: Repository<FacultyMember>,
    private fileService: FileService,
    private s3Service: S3Service,
  ) {}

  /**
   * 교수진 목록 조회 (페이지네이션 및 검색 지원)
   *
   * @param query 검색 및 페이지네이션 조건
   *              - name: 교수 이름으로 부분 검색 (LIKE 검색)
   *              - department: 학과명으로 부분 검색 (LIKE 검색)
   *              - page: 페이지 번호 (기본값: 1)
   *              - size: 페이지당 항목 수 (기본값: 20)
   * @returns 페이지네이션된 교수진 목록 응답
   */
  async findAll(query: FacultyQuery): Promise<PagedResponse<FacultyResponse>> {
    try {
      const { name, department, page = 1, size = 100 } = query;

      this.logger.log(
        `Finding faculty members - name: ${name || 'all'}, department: ${department || 'all'}, page: ${page}, size: ${size}`,
      );

      // QueryBuilder를 사용하여 동적 검색 조건 구성
      const queryBuilder = this.facultyRepository.createQueryBuilder('faculty');

      // 이름으로 부분 검색 (대소문자 구분 없음)
      if (name) {
        queryBuilder.andWhere('faculty.name LIKE :name', { name: `%${name}%` });
        this.logger.debug(`Added name filter: ${name}`);
      }

      // 학과명으로 부분 검색 (대소문자 구분 없음)
      if (department) {
        queryBuilder.andWhere('faculty.department LIKE :department', {
          department: `%${department}%`,
        });
        this.logger.debug(`Added department filter: ${department}`);
      }

      // 페이지네이션 적용 및 이름순 정렬로 결과 조회
      const [faculty, totalElements] = await queryBuilder
        .skip((page - 1) * size) // 페이지네이션: 건너뛸 항목 수
        .take(size) // 페이지네이션: 가져올 항목 수
        .orderBy('faculty.name', 'ASC') // 이름 오름차순 정렬
        .getManyAndCount(); // 데이터와 총 개수를 함께 조회

      this.logger.debug(
        `Found ${faculty.length} faculty members out of ${totalElements} total`,
      );

      // 엔티티를 응답 DTO로 변환하고 페이지네이션 정보와 함께 반환
      const items = faculty.map(member => this.toResponse(member));
      return new PagedResponse(items, page, size, totalElements);
    } catch (error) {
      this.logger.error('Error finding faculty members', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 특정 교수진 상세 정보 조회
   *
   * @param id 조회할 교수진 ID
   * @returns 교수진 상세 정보 응답
   * @throws NotFoundException 해당 ID의 교수진이 존재하지 않는 경우
   */
  async findOne(id: string): Promise<FacultyResponse> {
    try {
      this.logger.log(`Finding faculty member by id: ${id}`);

      // ID로 교수진 조회
      const faculty = await this.facultyRepository.findOne({ where: { id } });
      if (!faculty) {
        this.logger.warn(`Faculty member not found: ${id}`);
        throw FacultyException.facultyNotFound(id);
      }

      this.logger.debug(
        `Found faculty member: ${faculty.name} (${faculty.department})`,
      );
      return this.toResponse(faculty);
    } catch (error) {
      this.logger.error('Error finding faculty member', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 새 교수진 정보 생성
   *
   * @param createDto 생성할 교수진 정보
   * @returns 생성된 교수진 정보 응답
   * @throws ConflictException 이메일이 이미 존재하는 경우
   */
  async create(createDto: FacultyCreate): Promise<FacultyResponse> {
    try {
      this.logger.log(
        `Creating faculty member: ${createDto.name} (${createDto.department})`,
      );

      // 새 교수진 엔티티 생성 및 저장
      const faculty = this.facultyRepository.create(createDto);
      const saved = await this.facultyRepository.save(faculty);

      // temp 파일들을 실제 faculty ID로 업데이트
      await this.fileService.updateOwner('temp', saved.id, OwnerType.FACULTY);

      this.logger.log(
        `Faculty member created successfully: ${saved.name} (id: ${saved.id})`,
      );
      return this.toResponse(saved);
    } catch (error) {
      this.logger.error('Error creating faculty member', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 기존 교수진 정보 수정
   *
   * @param id 수정할 교수진 ID
   * @param updateDto 수정할 정보
   * @returns 수정된 교수진 정보 응답
   * @throws NotFoundException 해당 ID의 교수진이 존재하지 않는 경우
   * @throws ConflictException 변경하려는 이메일이 이미 존재하는 경우
   */
  async update(id: string, updateDto: FacultyUpdate): Promise<FacultyResponse> {
    try {
      this.logger.log(`Updating faculty member: ${id}`);

      // 수정할 교수진 존재 여부 확인
      const faculty = await this.facultyRepository.findOne({ where: { id } });
      if (!faculty) {
        this.logger.warn(`Faculty member not found for update: ${id}`);
        throw FacultyException.facultyNotFound(id);
      }

      this.logger.debug(`Found faculty member to update: ${faculty.name}`);

      // 변경사항 로깅
      const changes: string[] = [];
      if (updateDto.name && updateDto.name !== faculty.name) {
        changes.push(`name: ${faculty.name} → ${updateDto.name}`);
      }
      if (updateDto.email && updateDto.email !== faculty.email) {
        changes.push(`email: ${faculty.email} → ${updateDto.email}`);
      }
      if (updateDto.department && updateDto.department !== faculty.department) {
        changes.push(
          `department: ${faculty.department} → ${updateDto.department}`,
        );
      }
      if (updateDto.jobTitle && updateDto.jobTitle !== faculty.jobTitle) {
        changes.push(`jobTitle: ${faculty.jobTitle} → ${updateDto.jobTitle}`);
      }

      if (changes.length > 0) {
        this.logger.debug(`Faculty member changes: ${changes.join(', ')}`);
      }

      // 제공된 필드들로 기존 엔티티 업데이트
      Object.assign(faculty, updateDto);
      const saved = await this.facultyRepository.save(faculty);

      this.logger.log(
        `Faculty member updated successfully: ${saved.name} (id: ${saved.id})`,
      );
      return this.toResponse(saved);
    } catch (error) {
      this.logger.error('Error updating faculty member', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 교수진 정보 삭제
   *
   * @param id 삭제할 교수진 ID
   * @throws NotFoundException 해당 ID의 교수진이 존재하지 않는 경우
   */
  async delete(id: string): Promise<void> {
    try {
      this.logger.log(`Deleting faculty member: ${id}`);

      // 삭제할 교수진 존재 여부 확인
      const faculty = await this.facultyRepository.findOne({ where: { id } });
      if (!faculty) {
        this.logger.warn(`Faculty member not found for deletion: ${id}`);
        throw FacultyException.facultyNotFound(id);
      }

      this.logger.debug(`Found faculty member to delete: ${faculty.name}`);

      // 교수진 정보 삭제 (소프트 삭제)
      await this.facultyRepository.softRemove(faculty);

      this.logger.log(
        `Faculty member deleted successfully: ${faculty.name} (id: ${id})`,
      );
    } catch (error) {
      this.logger.error('Error deleting faculty member', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * FacultyMember 엔티티를 FacultyResponse DTO로 변환
   *
   * @param faculty FacultyMember 엔티티
   * @returns FacultyResponse DTO
   * @private 내부에서만 사용하는 유틸리티 메서드
   */
  private toResponse(faculty: FacultyMember): FacultyResponse {
    return {
      id: faculty.id,
      name: faculty.name, // 교수 이름
      jobTitle: faculty.jobTitle, // 직책 (교수, 부교수, 조교수 등)
      email: faculty.email, // 이메일 주소
      phoneNumber: faculty.phoneNumber, // 전화번호
      office: faculty.office, // 연구실/사무실 위치
      profileImageUrl: faculty.profileImageUrl ? this.s3Service.getFileUrl(faculty.profileImageUrl) : null, // 프로필 사진 URL
      department: faculty.department, // 소속 학과
      researchAreas: faculty.researchAreas, // 연구 분야
      biography: faculty.biography, // 약력/소개
      createdAt: faculty.createdAt, // 생성일시
    };
  }
}
