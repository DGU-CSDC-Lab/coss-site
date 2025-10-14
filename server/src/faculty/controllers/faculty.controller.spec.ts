import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FacultyController } from '@/faculty/controllers/faculty.controller';
import { FacultyService } from '@/faculty/services/faculty.service';
import { AdminGuard } from '@/auth/guards/admin.guard';
import { User } from '@/auth/entities';
import {
  FacultyCreate,
  FacultyUpdate,
  FacultyResponse,
  FacultyQuery,
} from '@/faculty/dto/faculty.dto';
import { PagedResponse } from '@/common/dto/response.dto';

describe('FacultyController', () => {
  let controller: FacultyController;
  let facultyService: FacultyService;

  const mockFacultyService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockJwtService = {
    verify: jest.fn(),
    sign: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockAdminGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacultyController],
      providers: [
        {
          provide: FacultyService,
          useValue: mockFacultyService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue(mockAdminGuard)
      .compile();

    controller = module.get<FacultyController>(FacultyController);
    facultyService = module.get<FacultyService>(FacultyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getFaculty', () => {
    it('should return paginated faculty list', async () => {
      const query: FacultyQuery = {
        name: '김교수',
        department: '지능IoT학과',
        page: 1,
        size: 20,
      };

      const expectedResult = new PagedResponse(
        [
          {
            id: 'faculty-1',
            name: '김교수',
            jobTitle: '교수',
            email: 'kim@iot.ac.kr',
            phoneNumber: '02-1234-5678',
            office: 'A동 101호',
            profileImageUrl: null,
            department: '지능IoT학과',
            researchAreas: ['AI', 'IoT'],
            biography: '교수 소개',
            createdAt: new Date(),
          } as FacultyResponse,
        ],
        1,
        20,
        1,
      );

      mockFacultyService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.getFaculty(query);

      expect(facultyService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getFacultyMember', () => {
    it('should return a single faculty member', async () => {
      const facultyId = 'faculty-1';
      const expectedFaculty: FacultyResponse = {
        id: facultyId,
        name: '김교수',
        jobTitle: '교수',
        email: 'kim@iot.ac.kr',
        phoneNumber: '02-1234-5678',
        office: 'A동 101호',
        profileImageUrl: null,
        department: '지능IoT학과',
        researchAreas: ['AI', 'IoT'],
        biography: '교수 소개',
        createdAt: new Date(),
      };

      mockFacultyService.findOne.mockResolvedValue(expectedFaculty);

      const result = await controller.getFacultyMember(facultyId);

      expect(facultyService.findOne).toHaveBeenCalledWith(facultyId);
      expect(result).toEqual(expectedFaculty);
    });
  });

  describe('createFaculty', () => {
    it('should create a new faculty member', async () => {
      const createDto: FacultyCreate = {
        name: '새교수',
        jobTitle: '조교수',
        email: 'new@iot.ac.kr',
        phoneNumber: '02-9876-5432',
        office: 'B동 201호',
        department: '지능IoT학과',
        researchAreas: ['Machine Learning'],
        biography: '새로운 교수입니다.',
      };

      const expectedFaculty: FacultyResponse = {
        id: 'new-faculty-id',
        name: createDto.name,
        jobTitle: createDto.jobTitle,
        email: createDto.email,
        phoneNumber: createDto.phoneNumber,
        office: createDto.office,
        profileImageUrl: null,
        department: createDto.department,
        researchAreas: createDto.researchAreas,
        biography: createDto.biography,
        createdAt: new Date(),
      };

      mockFacultyService.create.mockResolvedValue(expectedFaculty);

      const result = await controller.createFaculty(createDto);

      expect(facultyService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedFaculty);
    });
  });

  describe('updateFaculty', () => {
    it('should update an existing faculty member', async () => {
      const facultyId = 'faculty-1';
      const updateDto: FacultyUpdate = {
        name: '수정된교수',
        jobTitle: '부교수',
        email: 'updated@iot.ac.kr',
      };

      const expectedFaculty: FacultyResponse = {
        id: facultyId,
        name: updateDto.name,
        jobTitle: updateDto.jobTitle,
        email: updateDto.email,
        phoneNumber: '02-1234-5678',
        office: 'A동 101호',
        profileImageUrl: null,
        department: '지능IoT학과',
        researchAreas: ['AI', 'IoT'],
        biography: '교수 소개',
        createdAt: new Date(),
      };

      mockFacultyService.update.mockResolvedValue(expectedFaculty);

      const result = await controller.updateFaculty(facultyId, updateDto);

      expect(facultyService.update).toHaveBeenCalledWith(facultyId, updateDto);
      expect(result).toEqual(expectedFaculty);
    });
  });

  describe('deleteFaculty', () => {
    it('should delete a faculty member', async () => {
      const facultyId = 'faculty-1';

      mockFacultyService.delete.mockResolvedValue(undefined);

      const result = await controller.deleteFaculty(facultyId);

      expect(facultyService.delete).toHaveBeenCalledWith(facultyId);
      expect(result).toBeUndefined();
    });
  });
});
