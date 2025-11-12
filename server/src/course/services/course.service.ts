import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseMaster } from '@/course/entities';
import { CourseOffering } from '@/course/entities';
import {
  CourseMasterResponse,
  CourseOfferingResponse,
  CourseQuery,
  CourseUploadResult,
  CourseMasterCreate,
  CourseOfferingCreate,
  CourseMasterUpdate,
  CourseOfferingUpdate,
} from '@/course/dto/course.dto';
import { PagedResponse } from '@/common/dto/response.dto';
import { CommonException, CourseException } from '@/common/exceptions';

/**
 * 교과목 관리 서비스
 *
 * 지능IoT학과 교과목 정보를 관리하는 서비스입니다.
 * - 교과목 목록 조회 (다양한 필터링 및 정렬 옵션 지원)
 * - 교과목 상세 정보 조회
 * - 교과목 정보 생성, 수정, 삭제
 * - CSV 파일을 통한 교과목 일괄 업로드
 * - 년도/학기별 교과목 일괄 초기화
 */
@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);

  constructor(
    @InjectRepository(CourseMaster)
    private courseMasterRepository: Repository<CourseMaster>,
    @InjectRepository(CourseOffering)
    private courseOfferingRepository: Repository<CourseOffering>,
  ) {}

  /**
   * Master 교과목 목록 조회 (페이지네이션 및 다중 필터링 지원)
   *
   * @param query 검색 및 페이지네이션 조건
   *              - year: 연도 필터
   *              - semester: 학기 필터
   *              - department: 학과명 부분 검색
   *              - name: 교과목명 부분 검색
   *              - code: 교과목 코드 부분 검색
   *              - grade: 학년 부분 검색
   *              - sortBy: 정렬 기준 (name, code, department, grade, credit, createdAt)
   *              - sortOrder: 정렬 순서 (ASC, DESC)
   *              - page: 페이지 번호 (기본값: 1)
   *              - size: 페이지당 항목 수 (기본값: 20)
   * @returns 페이지네이션된 교과목 목록 응답
   */
  async findAllMasters(
    query: CourseQuery,
  ): Promise<PagedResponse<CourseMasterResponse>> {
    const {
      semester,
      department,
      subjectName,
      code,
      grade,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      size = 20,
    } = query;

    this.logger.log(
      `Finding courses - semester: ${semester || 'all'}, department: ${department || 'all'}, page: ${page}, size: ${size}`,
    );

    try {
      // QueryBuilder를 사용하여 동적 검색 조건 구성
      const queryBuilder =
        this.courseMasterRepository.createQueryBuilder('course');

      // 다양한 필터링 조건 적용
      if (semester) {
        queryBuilder.andWhere('course.semester = :semester', { semester });
        this.logger.debug(`Added semester filter: ${semester}`);
      }
      if (department) {
        queryBuilder.andWhere('course.department LIKE :department', {
          department: `%${department}%`,
        });
        this.logger.debug(`Added department filter: ${department}`);
      }
      if (subjectName) {
        queryBuilder.andWhere('course.subjectName LIKE :subjectName', {
          subjectName: `%${subjectName}%`,
        });
        this.logger.debug(`Added subjectName filter: ${subjectName}`);
      }
      if (code) {
        queryBuilder.andWhere('course.courseCode LIKE :code', {
          code: `%${code}%`,
        });
        this.logger.debug(`Added code filter: ${code}`);
      }
      if (grade) {
        queryBuilder.andWhere('course.grade LIKE :grade', {
          grade: `%${grade}%`,
        });
        this.logger.debug(`Added grade filter: ${grade}`);
      }

      // 정렬 조건 적용
      const sortField = this.getMasterSortField(sortBy);
      queryBuilder.orderBy(sortField, sortOrder);
      this.logger.debug(`Applied sorting: ${sortField} ${sortOrder}`);

      // 페이지네이션 적용 및 결과 조회
      const [courses, totalElements] = await queryBuilder
        .skip((page - 1) * size) // 페이지네이션: 건너뛸 항목 수
        .take(size) // 페이지네이션: 가져올 항목 수
        .getManyAndCount(); // 데이터와 총 개수를 함께 조회

      this.logger.debug(
        `Found ${courses.length} courses out of ${totalElements} total`,
      );

      // 엔티티를 응답 DTO로 변환하고 페이지네이션 정보와 함께 반환
      const items = courses.map(this.toResponseMaster);
      return new PagedResponse(items, page, size, totalElements);
    } catch (error) {
      this.logger.error('Error finding courses', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * Offering 교과목 목록 조회 (페이지네이션 및 다중 필터링 지원)
   *
   * @param query 검색 및 페이지네이션 조건
   *              - year: 연도 필터
   *              - semester: 학기 필터
   *              - department: 학과명 부분 검색
   *              - name: 교과목명 부분 검색
   *              - code: 교과목 코드 부분 검색
   *              - grade: 학년 부분 검색
   *              - sortBy: 정렬 기준 (name, code, department, grade, credit, createdAt)
   *              - sortOrder: 정렬 순서 (ASC, DESC)
   *              - page: 페이지 번호 (기본값: 1)
   *              - size: 페이지당 항목 수 (기본값: 20)
   * @returns 페이지네이션된 교과목 목록 응답
   */
  async findAllOfferings(
    query: CourseQuery,
  ): Promise<PagedResponse<CourseOfferingResponse>> {
    const {
      year,
      semester,
      department,
      subjectName,
      code,
      grade,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      size = 20,
    } = query;

    this.logger.log(
      `Finding courses - year: ${year || 'all'}, semester: ${semester || 'all'}, department: ${department || 'all'}, page: ${page}, size: ${size}`,
    );

    try {
      // QueryBuilder를 사용하여 동적 검색 조건 구성
      const queryBuilder = this.courseOfferingRepository
        .createQueryBuilder('offering')
        .innerJoinAndSelect('offering.master', 'master'); // CourseMaster INNER JOIN (master가 없는 레코드 제외)

      // 다양한 필터링 조건 적용
      if (year) {
        queryBuilder.andWhere('offering.year = :year', { year });
        this.logger.debug(`Added year filter: ${year}`);
      }
      if (semester) {
        queryBuilder.andWhere('offering.semester = :semester', { semester });
        this.logger.debug(`Added semester filter: ${semester}`);
      }
      if (department) {
        queryBuilder.andWhere('offering.master.department LIKE :department', {
          department: `%${department}%`,
        });
        this.logger.debug(`Added department filter: ${department}`);
      }
      if (subjectName) {
        queryBuilder.andWhere('offering.master.subjectName LIKE :subjectName', {
          subjectName: `%${subjectName}%`,
        });
        this.logger.debug(`Added subjectName filter: ${subjectName}`);
      }
      if (subjectName) {
        queryBuilder.andWhere('offering.master.subjectName LIKE :subjectName', {
          subjectName: `%${subjectName}%`,
        });
        this.logger.debug(`Added subjectName filter: ${subjectName}`);
      }
      if (code) {
        queryBuilder.andWhere('offering.master.courseCode LIKE :code', {
          code: `%${code}%`,
        });
        this.logger.debug(`Added code filter: ${code}`);
      }
      if (grade) {
        queryBuilder.andWhere('offering.master.grade LIKE :grade', {
          grade: `%${grade}%`,
        });
        this.logger.debug(`Added grade filter: ${grade}`);
      }

      // 정렬 조건 적용
      const sortField = this.getOfferingSortField(sortBy);
      queryBuilder.orderBy(sortField, sortOrder);
      this.logger.debug(`Applied sorting: ${sortField} ${sortOrder}`);

      // 페이지네이션 적용 및 결과 조회
      const [courses, totalElements] = await queryBuilder
        .skip((page - 1) * size) // 페이지네이션: 건너뛸 항목 수
        .take(size) // 페이지네이션: 가져올 항목 수
        .getManyAndCount(); // 데이터와 총 개수를 함께 조회

      // master가 null인 경우 로깅
      const nullMaster = courses.filter(c => !c.master);
      if (nullMaster.length > 0) {
        this.logger.warn(
          `Found ${nullMaster.length} offerings with null master`,
        );
      }

      // null-safe 변환
      const items = courses.map(offering => this.toResponseOffering(offering));

      return new PagedResponse(items, page, size, totalElements);
    } catch (error) {
      this.logger.error('Error finding courses', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * Master 교과목용 정렬 필드명 매핑
   */
  private getMasterSortField(sortBy: string): string {
    const fieldMap: { [key: string]: string } = {
      name: 'course.name',
      code: 'course.code',
      department: 'course.department',
      grade: 'course.grade',
      credit: 'course.credit',
      createdAt: 'course.createdAt',
    };
    return fieldMap[sortBy] || 'course.createdAt';
  }

  /**
   * Offering 교과목용 정렬 필드명 매핑
   */
  private getOfferingSortField(sortBy: string): string {
    const fieldMap: { [key: string]: string } = {
      name: 'master.name',
      code: 'master.code',
      department: 'master.department',
      grade: 'master.grade',
      credit: 'master.credit',
      createdAt: 'offering.createdAt',
    };
    return fieldMap[sortBy] || 'offering.createdAt';
  }

  /**
   * 특정 교과목 상세 정보 조회
   *
   * @param id 조회할 교과목 ID
   * @returns 교과목 상세 정보 응답
   * @throws NotFoundException 해당 ID의 교과목이 존재하지 않는 경우
   */
  async findOne(id: string): Promise<CourseOfferingResponse> {
    this.logger.log(`Finding course by id: ${id}`);

    try {
      // ID로 교과목 조회
      const course = await this.courseOfferingRepository.findOne({
        where: { id },
        relations: ['master'], // master 관계 포함
      });
      if (!course) {
        this.logger.warn(`Course not found: ${id}`);
        throw CourseException.courseNotFound(id);
      }

      this.logger.debug(
        `Found course: ${course.master?.subjectName || 'N/A'} (${course.master?.courseCode || 'N/A'})`,
      );
      return this.toResponseOffering(course);
    } catch (error) {
      this.logger.error('Error finding course', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 새 Master 교과목 정보 생성
   *
   * @param createDto 생성할 교과목 정보
   * @returns 생성된 교과목 정보 응답
   */
  async createMaster(
    createDto: CourseMasterCreate,
  ): Promise<CourseMasterResponse> {
    this.logger.debug(
      `Creating course: ${createDto.subjectName} (${createDto.courseCode})`,
    );
    try {
      // DTO 필드명을 엔티티 필드명으로 매핑하여 교과목 엔티티 생성
      const course = this.courseMasterRepository.create({
        semester: createDto.semester,
        department: createDto.department,
        courseCode: createDto.courseCode, // DTO의 courseCode -> 엔티티의 code
        subjectName: createDto.subjectName, // DTO의 subjectName -> 엔티티의 name
        englishName: createDto.englishName,
        description: createDto.description,
        grade: createDto.grade,
        credit: createDto.credit,
        courseType: createDto.courseType,
      });

      // 데이터베이스에 저장
      const saved = await this.courseMasterRepository.save(course);
      this.logger.log(
        `Course created successfully: ${saved.subjectName} (id: ${saved.id})`,
      );

      return this.toResponseMaster(saved);
    } catch (error) {
      this.logger.error('Error creating course', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 새 교과목 정보 생성
   *
   * @param createDto 생성할 교과목 정보
   * @returns 생성된 교과목 정보 응답
   */
  async createOffering(
    createDto: CourseOfferingCreate,
  ): Promise<CourseOfferingResponse> {
    this.logger.debug(
      `Creating course: ${createDto.masterId} (${createDto.year} ${createDto.semester})`,
    );

    const master = await this.courseMasterRepository.findOne({
      where: { id: createDto.masterId },
    });
    if (!master) {
      this.logger.warn(`Master course not found: ${createDto.masterId}`);
      throw CourseException.courseMasterNotFound(createDto.masterId);
    }

    try {
      // DTO 필드명을 엔티티 필드명으로 매핑하여 교과목 엔티티 생성
      const course = this.courseOfferingRepository.create({
        master: master,
        year: createDto.year,
        semester: createDto.semester,
        classTime: createDto.classTime, // DTO의 classTime -> 엔티티의 classTime
        instructor: createDto.instructor,
        classroom: createDto.classroom,
        syllabusUrl: createDto.syllabusUrl,
      });

      // 데이터베이스에 저장
      const saved = await this.courseOfferingRepository.save(course);
      this.logger.log(
        `Course created successfully: ${saved.master.subjectName} (id: ${saved.id})`,
      );

      return this.toResponseOffering(saved);
    } catch (error) {
      this.logger.error('Error creating course', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 기존 Master 교과목 정보 수정
   *
   * @param id 수정할 교과목 ID
   * @param updateDto 수정할 정보
   * @returns 수정된 교과목 정보 응답
   * @throws NotFoundException 해당 ID의 교과목이 존재하지 않는 경우
   */
  async updateMaster(
    id: string,
    updateDto: CourseMasterUpdate,
  ): Promise<CourseMasterResponse> {
    try {
      this.logger.debug(`Updating course: ${id}`);

      // 수정할 교과목 존재 여부 확인
      const course = await this.courseMasterRepository.findOne({
        where: { id },
      });
      if (!course) {
        this.logger.warn(`Course not found for update: ${id}`);
        throw CourseException.courseNotFound(id);
      }

      this.logger.debug(
        `Found course to update: ${course.subjectName} (${course.courseCode})`,
      );

      // 변경사항 로깅
      const changes: string[] = [];
      if (
        updateDto.subjectName &&
        updateDto.subjectName !== course.subjectName
      ) {
        changes.push(`name: ${course.subjectName} → ${updateDto.subjectName}`);
      }
      if (updateDto.courseCode && updateDto.courseCode !== course.courseCode) {
        changes.push(`code: ${course.courseCode} → ${updateDto.courseCode}`);
      }
      if (updateDto.semester && updateDto.semester !== course.semester) {
        changes.push(`semester: ${course.semester} → ${updateDto.semester}`);
      }
      if (
        updateDto.description &&
        updateDto.description !== course.description
      ) {
        changes.push(
          `description: ${course.description} → ${updateDto.description}`,
        );
      }

      if (changes.length > 0) {
        this.logger.debug(`Course changes: ${changes.join(', ')}`);
      }

      // 제공된 필드들로 기존 엔티티 업데이트 (null 병합 연산자 사용)
      Object.assign(course, {
        semester: updateDto.semester ?? course.semester,
        department: updateDto.department ?? course.department,
        code: updateDto.courseCode ?? course.courseCode,
        subjectName: updateDto.subjectName ?? course.subjectName,
        englishName: updateDto.englishName ?? course.englishName,
        grade: updateDto.grade ?? course.grade,
        credit: updateDto.credit ?? course.credit,
        courseType: updateDto.courseType ?? course.courseType,
      });

      // 변경사항 저장
      const saved = await this.courseMasterRepository.save(course);
      this.logger.log(
        `Course updated successfully: ${saved.subjectName} (id: ${saved.id})`,
      );

      return this.toResponseMaster(saved);
    } catch (error) {
      this.logger.error('Error updating course', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 기존 Offering 교과목 정보 수정
   *
   * @param id 수정할 교과목 ID
   * @param updateDto 수정할 정보
   * @returns 수정된 교과목 정보 응답
   * @throws NotFoundException 해당 ID의 교과목이 존재하지 않는 경우
   */
  async updateOffering(
    id: string,
    updateDto: CourseOfferingUpdate,
  ): Promise<CourseOfferingResponse> {
    try {
      this.logger.debug(`Updating course: ${id}`);

      // 수정할 교과목 존재 여부 확인
      const course = await this.courseOfferingRepository.findOne({
        where: { id },
      });
      if (!course) {
        this.logger.warn(`Course not found for update: ${id}`);
        throw CourseException.courseNotFound(id);
      }

      this.logger.debug(
        `Found course to update: ${course.master.subjectName} (${course.master.courseCode})`,
      );

      // 변경사항 로깅
      const changes: string[] = [];
      if (updateDto.year && updateDto.year !== course.year) {
        changes.push(`year: ${course.year} → ${updateDto.year}`);
      }
      if (updateDto.semester && updateDto.semester !== course.semester) {
        changes.push(`semester: ${course.semester} → ${updateDto.semester}`);
      }

      if (changes.length > 0) {
        this.logger.debug(`Course changes: ${changes.join(', ')}`);
      }

      // 제공된 필드들로 기존 엔티티 업데이트 (null 병합 연산자 사용)
      Object.assign(course, {
        year: updateDto.year ?? course.year,
        semester: updateDto.semester ?? course.semester,
        time: updateDto.classTime ?? course.classTime,
        instructor: updateDto.instructor ?? course.instructor,
        classroom: updateDto.classroom ?? course.classroom,
        syllabusUrl: updateDto.syllabusUrl ?? course.syllabusUrl,
      });

      // 변경사항 저장
      const saved = await this.courseOfferingRepository.save(course);
      this.logger.log(
        `Course Offering updated successfully: Master: ${saved.master.subjectName} (id: ${saved.id})`,
      );

      return this.toResponseOffering(saved);
    } catch (error) {
      this.logger.error('Error updating course', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * Master 교과목 일괄 초기화
   *
   * @param courses 새로 등록할 교과목 목록
   * @returns 업로드 결과 (성공/실패 개수, 에러 목록)
   */
  async bulkInitMaster(
    year: number,
    semester: string,
    courses: CourseMasterCreate[],
  ): Promise<CourseUploadResult> {
    this.logger.debug(
      `Bulk initializing courses for Master - ${courses.length} courses`,
    );

    try {
      // 기존 년도/학기 데이터 삭제
      const deleteResult = await this.courseMasterRepository.deleteAll();
      this.logger.log(
        `Deleted ${deleteResult.affected || 0} existing courses for Master`,
      );

      let successCount = 0;
      const errors: string[] = [];

      // 새 데이터 추가
      for (let i = 0; i < courses.length; i++) {
        try {
          // DTO 필드명을 엔티티 필드명으로 매핑
          const courseData = {
            semester: courses[i].semester,
            department: courses[i].department,
            code: courses[i].courseCode,
            name: courses[i].subjectName,
            englishName: courses[i].englishName,
            grade: courses[i].grade,
            credit: courses[i].credit,
            courseType: courses[i].courseType,
          };

          const course = this.courseMasterRepository.create(courseData);
          await this.courseMasterRepository.save(course);
          successCount++;

          if ((i + 1) % 10 === 0) {
            this.logger.debug(`Processed ${i + 1}/${courses.length} courses`);
          }
        } catch (error) {
          const errorMsg = `${i + 1}번째 교과목: ${error.message}`;
          errors.push(errorMsg);
          this.logger.warn(errorMsg);
        }
      }

      this.logger.log(
        `Bulk init completed - Success: ${successCount}, Failed: ${errors.length}`,
      );

      return {
        successCount,
        failureCount: errors.length,
        errors,
      };
    } catch (error) {
      this.logger.error('Error during bulk course initialization', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 특정 년도/학기의 교과목 일괄 초기화
   *
   * @param year 대상 연도
   * @param semester 대상 학기
   * @param courses 새로 등록할 교과목 목록
   * @returns 업로드 결과 (성공/실패 개수, 에러 목록)
   */
  async bulkInitOffering(
    year: number,
    semester: string,
    courses: CourseOfferingCreate[],
  ): Promise<CourseUploadResult> {
    this.logger.debug(
      `Bulk initializing courses for ${year} ${semester} - ${courses.length} courses`,
    );

    try {
      // 기존 년도/학기 데이터 삭제
      const deleteResult = await this.courseOfferingRepository.delete({
        year,
        semester,
      });
      this.logger.log(
        `Deleted ${deleteResult.affected || 0} existing courses for ${year} ${semester}`,
      );

      let successCount = 0;
      const errors: string[] = [];

      // 새 데이터 추가
      for (let i = 0; i < courses.length; i++) {
        try {
          // DTO 필드명을 엔티티 필드명으로 매핑
          const courseData = {
            year,
            semester,
            classTime: courses[i].classTime,
            instructor: courses[i].instructor,
            classroom: courses[i].classroom,
            syllabusUrl: courses[i].syllabusUrl,
          };

          const course = this.courseOfferingRepository.create(courseData);
          await this.courseOfferingRepository.save(course);
          successCount++;

          if ((i + 1) % 10 === 0) {
            this.logger.debug(`Processed ${i + 1}/${courses.length} courses`);
          }
        } catch (error) {
          const errorMsg = `${i + 1}번째 교과목: ${error.message}`;
          errors.push(errorMsg);
          this.logger.warn(errorMsg);
        }
      }

      this.logger.log(
        `Bulk init completed - Success: ${successCount}, Failed: ${errors.length}`,
      );

      return {
        successCount,
        failureCount: errors.length,
        errors,
      };
    } catch (error) {
      this.logger.error('Error during bulk course initialization', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 교과목 정보 삭제
   *
   * @param id 삭제할 교과목 ID
   * @throws NotFoundException 해당 ID의 교과목이 존재하지 않는 경우
   */
  async deleteMaster(id: string): Promise<void> {
    this.logger.debug(`Deleting course: ${id}`);

    try {
      // 삭제할 교과목 존재 여부 확인
      const course = await this.courseMasterRepository.findOne({
        where: { id },
      });
      if (!course) {
        this.logger.warn(`Course not found for deletion: ${id}`);
        throw CourseException.courseNotFound(id);
      }

      this.logger.debug(
        `Found course to delete: ${course.subjectName} (${course.courseCode})`,
      );

      // 교과목 정보 삭제 (소프트 삭제)
      await this.courseMasterRepository.softRemove(course);

      this.logger.log(
        `Course deleted successfully: ${course.subjectName} (id: ${id})`,
      );
    } catch (error) {
      this.logger.error('Error deleting course', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 교과목 정보 삭제
   *
   * @param id 삭제할 교과목 ID
   * @throws NotFoundException 해당 ID의 교과목이 존재하지 않는 경우
   */
  async deleteOffering(id: string): Promise<void> {
    this.logger.debug(`Deleting course: ${id}`);

    try {
      // 삭제할 교과목 존재 여부 확인
      const course = await this.courseOfferingRepository.findOne({
        where: { id },
        relations: ['master'],
      });
      if (!course) {
        this.logger.warn(`Course not found for deletion: ${id}`);
        throw CourseException.courseNotFound(id);
      }

      this.logger.debug(
        `Found course to delete: ${course.master.subjectName} (${course.instructor}, ${course.classTime})`,
      );

      // 교과목 정보 삭제 (소프트 삭제)
      await this.courseOfferingRepository.softRemove(course);

      this.logger.log(
        `Course deleted successfully: (id: ${id}) ${course.master.subjectName} (${course.instructor}, ${course.classTime})`,
      );
    } catch (error) {
      this.logger.error('Error deleting course', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * CSV 파일을 통한 교과목 일괄 업로드
   *
   * @param file CSV 파일 버퍼
   * @returns 업로드 결과 (성공/실패 개수, 에러 목록)
   * @throws BadRequestException CSV 파일이 아니거나 형식이 잘못된 경우
   */
  async uploadFromMasterFile(
    file: Express.Multer.File,
  ): Promise<CourseUploadResult> {
    this.logger.debug(`Uploading courses from file: ${file.originalname}`);

    try {
      // 파일명 검증
      if (!file.originalname) {
        this.logger.warn('No filename provided');
        throw CourseException.fileNotProvided();
      }

      // 파일 확장자 검증 (Excel 파일 지원)
      const isExcel =
        file.originalname.endsWith('.xlsx') ||
        file.originalname.endsWith('.xls');
      const isCsv = file.originalname.endsWith('.csv');

      if (!isExcel && !isCsv) {
        this.logger.warn(`Invalid file type: ${file.originalname}`);
        throw CourseException.invalidFileType(file.mimetype);
      }

      let lines: string[];

      if (isExcel) {
        // Excel 파일 처리
        const XLSX = require('xlsx');
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const csvData = XLSX.utils.sheet_to_csv(worksheet);
        lines = csvData.split('\n').filter(line => line.trim());
      } else {
        // CSV 데이터 파싱
        const csvData = file.buffer.toString('utf-8');
        lines = csvData.split('\n').filter(line => line.trim());
      }

      if (lines.length < 2) {
        this.logger.warn(`Invalid CSV format: ${lines.length} lines`);
        throw CourseException.moreThanOneHeaderRow();
      }

      this.logger.debug(`Processing ${lines.length - 1} data rows from CSV`);

      const errors: string[] = [];
      let successCount = 0;
      let failureCount = 0;

      // 헤더 행 건너뛰고 데이터 행 처리
      for (let i = 1; i < lines.length; i++) {
        try {
          // CSV 행을 컬럼으로 분할 (쉼표 기준)
          const columns = lines[i].split(',').map(col => col.trim());

          if (columns.length < 4) {
            const errorMsg = `Row ${i + 1}: Insufficient columns`;
            errors.push(errorMsg);
            failureCount++;
            continue;
          }

          // CSV 컬럼을 CourseMasterCreate DTO로 매핑
          const courseData: CourseMasterCreate = {
            semester: columns[0] || '1학기',
            department: columns[1] || '',
            courseCode: columns[2] || '',
            subjectName: columns[3] || '',
            englishName: columns[4] || '',
            description: columns[5] || '',
            grade: columns[6] || '',
            credit: columns[7]
              ? isNaN(parseFloat(columns[7]))
                ? 0
                : parseFloat(columns[7])
              : 0,
            courseType: columns[8] || '',
          };

          // 교과목 생성
          await this.createMaster(courseData);
          successCount++;

          if (successCount % 10 === 0) {
            this.logger.debug(`Processed ${successCount} courses from CSV`);
          }
        } catch (error) {
          const errorMsg = `Row ${i + 1}: ${error.message}`;
          errors.push(errorMsg);
          failureCount++;
          this.logger.warn(errorMsg);
        }
      }

      this.logger.log(
        `CSV upload completed - Success: ${successCount}, Failed: ${failureCount}`,
      );

      return {
        successCount,
        failureCount,
        errors,
      };
    } catch (error) {
      this.logger.error('Error uploading courses from file', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * CSV 파일을 통한 교과목 일괄 업로드
   *
   * @param buffer CSV 파일 버퍼
   * @param filename 파일명 (확장자 검증용)
   * @returns 업로드 결과 (성공/실패 개수, 에러 목록)
   * @throws BadRequestException CSV 파일이 아니거나 형식이 잘못된 경우
   */
  async uploadFromOfferingFile(
    file: Express.Multer.File,
  ): Promise<CourseUploadResult> {
    this.logger.debug(`Uploading courses from file: ${file.originalname}`);

    try {
      // 파일명 검증
      if (!file.originalname) {
        this.logger.warn('No filename provided');
        throw CourseException.fileNotProvided();
      }

      // 파일 확장자 검증 (Excel 파일 지원)
      const isExcel =
        file.originalname.endsWith('.xlsx') ||
        file.originalname.endsWith('.xls');
      const isCsv = file.originalname.endsWith('.csv');

      if (!isExcel && !isCsv) {
        this.logger.warn(`Invalid file type: ${file.originalname}`);
        throw CourseException.invalidFileType(file.mimetype);
      }

      let lines: string[];

      if (isExcel) {
        // Excel 파일 처리
        const XLSX = require('xlsx');
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const csvData = XLSX.utils.sheet_to_csv(worksheet);
        lines = csvData.split('\n').filter(line => line.trim());
      } else {
        // CSV 데이터 파싱
        const csvData = file.buffer.toString('utf-8');
        lines = csvData.split('\n').filter(line => line.trim());
      }

      if (lines.length < 2) {
        this.logger.warn(`Invalid CSV format: ${lines.length} lines`);
        throw CourseException.moreThanOneHeaderRow();
      }

      this.logger.debug(`Processing ${lines.length - 1} data rows from CSV`);

      const errors: string[] = [];
      let successCount = 0;
      let failureCount = 0;
      // 헤더 행 건너뛰고 데이터 행 처리
      for (let i = 1; i < lines.length; i++) {
        try {
          // CSV 행을 컬럼으로 분할 (쉼표 기준)
          const columns = lines[i].split(',').map(col => col.trim());

          if (columns.length < 4) {
            const errorMsg = `Row ${i + 1}: Insufficient columns`;
            errors.push(errorMsg);
            failureCount++;
            continue;
          }

          // CSV 컬럼을 CourseCreate DTO로 매핑
          const courseCode = columns[0] || '';
          
          // 교과목 코드로 마스터 교과목 찾기
          const masterCourse = await this.courseMasterRepository.findOne({
            where: { courseCode }
          });
          
          if (!masterCourse) {
            const errorMsg = `Row ${i + 1}: Master course not found for code: ${courseCode}`;
            errors.push(errorMsg);
            failureCount++;
            continue;
          }

          const courseData: CourseOfferingCreate = {
            masterId: masterCourse.id,
            year: parseInt(columns[1]) || new Date().getFullYear(),
            semester: columns[2] || '1학기',
            classTime: columns[3] || '',
            instructor: columns[4] || '',
            classroom: columns[5] || '',
            syllabusUrl: columns[6] || '',
          };

          // 교과목 생성
          await this.createOffering(courseData);
          successCount++;

          if (successCount % 10 === 0) {
            this.logger.debug(`Processed ${successCount} courses from CSV`);
          }
        } catch (error) {
          const errorMsg = `Row ${i + 1}: ${error.message}`;
          errors.push(errorMsg);
          failureCount++;
          this.logger.warn(errorMsg);
        }
      }

      this.logger.log(
        `CSV upload completed - Success: ${successCount}, Failed: ${failureCount}`,
      );

      return {
        successCount,
        failureCount,
        errors,
      };
    } catch (error) {
      this.logger.error('Error uploading courses from file', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * Course 엔티티를 CourseResponse DTO로 변환
   *
   * @param course Course 엔티티
   * @returns CourseResponse DTO
   * @private 내부에서만 사용하는 유틸리티 메서드
   */
  private toResponseMaster(course: CourseMaster): CourseMasterResponse {
    return {
      id: course.id,
      semester: course.semester, // 학기
      department: course.department, // 학과
      courseCode: course.courseCode, // 엔티티의 code -> DTO의 courseCode
      subjectName: course.subjectName, // 엔티티의 name -> DTO의 subjectName
      englishName: course.englishName, // 영문 교과목명
      description: course.description, // 교과목 설명
      grade: course.grade, // 학년
      credit: course.credit, // 학점
      courseType: course.courseType, // 교과목 유형
    };
  }

  /**
   * Course 엔티티를 CourseResponse DTO로 변환
   *
   * @param course Course 엔티티
   * @returns CourseResponse DTO
   * @private 내부에서만 사용하는 유틸리티 메서드
   */
  private toResponseOffering(course: CourseOffering): CourseOfferingResponse {
    // master가 null인 경우 처리
    if (!course.master) {
      this.logger.warn(
        `Course offering ${course.id} has no associated master course`,
      );
      return {
        id: course.id,
        year: course.year,
        semester: course.semester,
        department: 'N/A',
        courseCode: 'N/A',
        subjectName: 'N/A',
        englishName: null,
        description: 'Master course not found',
        grade: null,
        credit: null,
        classTime: course.classTime,
        instructor: course.instructor,
        classroom: course.classroom,
        syllabusUrl: course.syllabusUrl,
        courseType: null,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      };
    }

    return {
      id: course.id,
      year: course.year, // 연도
      semester: course.semester, // 학기
      department: course.master.department, // 학과
      courseCode: course.master.courseCode, // 엔티티의 code -> DTO의 courseCode
      subjectName: course.master.subjectName, // 엔티티의 name -> DTO의 subjectName
      englishName: course.master.englishName, // 영문 교과목명
      description: course.master.description, // 교과목 설명
      grade: course.master.grade, // 학년
      credit: course.master.credit, // 학점
      classTime: course.classTime, // 엔티티의 time -> DTO의 classTime
      instructor: course.instructor, // 담당교수
      classroom: course.classroom, // 강의실
      courseType: course.master.courseType ?? null, // 교과목 유형
      syllabusUrl: course.syllabusUrl, // 강의계획서 URL
      createdAt: course.createdAt, // 생성일시
      updatedAt: course.updatedAt, // 수정일시
    };
  }
}
