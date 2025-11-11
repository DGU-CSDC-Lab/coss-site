/**
 * 초기 데이터를 넣는 역할
 * 의존성으로 주입 가능함.
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Account, User, UserRole } from '@/auth/entities';
import { Category } from '@/category/entities';
import * as bcrypt from 'bcrypt';

import { Logger } from '@nestjs/common';

@Injectable()
export class DatabaseSeeder implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    this.logger.log(`Database seeding started (${process.env.NODE_ENV})`);
    if (process.env.NODE_ENV === 'production') {
      await this.seedProd();
    } else {
      await this.seedLocal();
    }
  }

  // 운영 환경용 시드
  async seedProd() {
    try {
      // 운영 환경에서는 기본 카테고리만 생성
      await this.seedCategories();
      this.logger.log('Database seeding completed successfully');
    } catch (error) {
      this.logger.error('Database seeding failed:', error);
    }
  }

  // 로컬 개발환경용 시드
  async seedLocal() {
    try {
      await this.seedAdminUser();
      await this.seedCategories();
      this.logger.log('Database seeding completed successfully');
    } catch (error) {
      this.logger.error('Database seeding failed:', error);
    }
  }

  // 관리자 계정 생성
  private async seedAdminUser() {
    this.logger.log('Creating admin user...');
    const userRepository = this.dataSource.getRepository(User);

    // 이미 관리자 계정이 존재하는지 확인
    const existingAdmin = await userRepository.findOne({
      where: { role: UserRole.ADMINISTRATOR },
    });

    // 존재하면 종료
    if (existingAdmin) {
      this.logger.log('Admin user already exists, skipping creation');
      return;
    }

    await this.dataSource.transaction(async manager => {
      // 해시 비밀번호 생성
      const hashedPassword = await bcrypt.hash('1234', 10);
      this.logger.debug('Password hashed successfully');

      // 계정 및 사용자 생성
      const account = new Account();
      account.email = 'admin@iot.ac.kr';
      account.passwordHash = hashedPassword;
      account.isFirstLogin = false;

      // 트랜잭션으로 묶어서 처리
      const savedAccount = await manager.save(Account, account);
      this.logger.debug(`Admin account created: ${savedAccount.email}`);

      // 관리자 유저 생성
      const user = new User();
      user.account = savedAccount;
      user.username = 'Administrator';
      user.role = UserRole.ADMIN;

      await manager.save(User, user);
      this.logger.debug(`Admin user created: ${user.username}`);
    });

    this.logger.log('Admin user created successfully');
  }

  private async seedCategories() {
    this.logger.log('Creating categories...');
    const categoryRepository = this.dataSource.getRepository(Category);

    // 이미 카테고리가 존재하는지 확인
    const existingCategories = await categoryRepository.count();
    if (existingCategories > 0) {
      this.logger.log(
        `Categories already exist (${existingCategories} found), skipping creation`,
      );
      return;
    }

    // 소식
    const news = categoryRepository.create({
      name: '소식',
      slug: 'announcements',
      description: '소식을 공유하는 상위 게시판',
      order: 1,
    });
    const savedNews = await categoryRepository.save(news);
    this.logger.debug(`Created category: ${savedNews.name}`);

    // 소식 하위 카테고리
    const newsSubCategories = [
      {
        name: '장학정보',
        slug: 'scholarships',
        description: '장학금 관련 정보를 공유하는 하위 게시판',
        order: 1,
      },
      {
        name: '뉴스',
        slug: 'department-news',
        description: '학과 뉴스, 대표 이미지가 있는 하위 게시판',
        order: 2,
      },
      {
        name: '자료실',
        slug: 'resources',
        description: '각종 자료 및 문서 하위 게시판',
        order: 3,
      },
    ];

    for (const subCat of newsSubCategories) {
      const created = await categoryRepository.save(
        categoryRepository.create({
          name: subCat.name,
          slug: subCat.slug,
          description: subCat.description,
          parentId: savedNews.id,
          order: subCat.order,
        }),
      );
      this.logger.debug(`Created subcategory: ${created.name}`);
    }

    // 공지사항
    const notice = categoryRepository.create({
      name: '공지사항',
      slug: 'notices',
      description: '공지사항을 공유하는 상위 게시판',
      order: 2,
    });
    const savedNotice = await categoryRepository.save(notice);
    this.logger.debug(`Created category: ${savedNotice.name}`);

    // 공모전/채용 정보
    const contest = categoryRepository.create({
      name: '공모전/채용 정보',
      slug: 'contest-job',
      description: '공모전 및 채용 정보를 공유하는 상위 게시판',
      parentId: savedNotice.id,
      order: 1,
    });
    const savedContest = await categoryRepository.save(contest);
    this.logger.debug(`Created category: ${savedContest.name}`);

    // 공모전/채용 정보 하위 카테고리
    const contestSubCategories = [
      {
        name: '공모전 정보',
        slug: 'contest-info',
        description: '각종 공모전 정보를 공유하는 하위 게시판',
        order: 1,
      },
      {
        name: '교육/활동/취업 정보',
        slug: 'education-job',
        description: '교육, 활동, 취업 관련 정보를 공유하는 하위 게시판',
        order: 2,
      },
    ];

    // 임시
    const draft = categoryRepository.create({
      name: '임시',
      slug: 'draft',
      description: '임시 게시판',
      order: 1,
    });
    const savedDraft = await categoryRepository.save(draft);
    this.logger.debug(`Created category: ${savedDraft.name}`);

    for (const subCat of contestSubCategories) {
      const created = await categoryRepository.save(
        categoryRepository.create({
          name: subCat.name,
          slug: subCat.slug,
          description: subCat.description,
          parentId: savedContest.id,
          order: subCat.order,
        }),
      );
      this.logger.debug(`Created subcategory: ${created.name}`);
    }

    this.logger.log('Categories created successfully');
  }
}
