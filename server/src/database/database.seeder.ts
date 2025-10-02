import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Account, User, UserRole } from '../auth/entities';
import { Category } from '../category/entities';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DatabaseSeeder implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'production') {
      await this.seed();
    }
  }

  async seed() {
    try {
      await this.seedAdminUser();
      await this.seedCategories();
      console.log('Database seeding completed');
    } catch (error) {
      console.error('Database seeding failed:', error);
    }
  }

  private async seedAdminUser() {
    const userRepository = this.dataSource.getRepository(User);
    const accountRepository = this.dataSource.getRepository(Account);

    const existingAdmin = await userRepository.findOne({
      where: { role: UserRole.ADMIN },
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123!', 10);
    
    const account = new Account();
    account.email = 'admin@iot.ac.kr';
    account.passwordHash = hashedPassword;
    const savedAccount = await accountRepository.save(account);

    const user = new User();
    user.accountId = savedAccount.id;
    user.username = 'Administrator';
    user.role = UserRole.ADMIN;
    await userRepository.save(user);

    console.log('Admin user created: admin@iot.ac.kr / admin123!');
  }

  private async seedCategories() {
    const categoryRepository = this.dataSource.getRepository(Category);

    const existingCategories = await categoryRepository.count();
    if (existingCategories > 0) {
      console.log('Categories already exist');
      return;
    }

    // 소식 (대표 이미지 존재)
    const news = categoryRepository.create({
      name: '소식',
      slug: 'news',
      description: '대표 이미지가 있는 소식 게시판',
      displayOrder: 1,
    });
    const savedNews = await categoryRepository.save(news);

    // 소식 하위 카테고리
    const newsSubCategories = [
      { name: '장학정보', slug: 'scholarship', description: '장학금 관련 정보', order: 1 },
      { name: '뉴스', slug: 'news-articles', description: '학과 뉴스', order: 2 },
      { name: '자료실', slug: 'resources', description: '각종 자료 및 문서', order: 3 },
    ];

    for (const subCat of newsSubCategories) {
      await categoryRepository.save(categoryRepository.create({
        name: subCat.name,
        slug: subCat.slug,
        description: subCat.description,
        parentId: savedNews.id,
        displayOrder: subCat.order,
      }));
    }

    // 공지사항
    const notice = categoryRepository.create({
      name: '공지사항',
      slug: 'notice',
      description: '공지사항 게시판',
      displayOrder: 2,
    });
    const savedNotice = await categoryRepository.save(notice);

    // 공모전/채용 정보
    const contest = categoryRepository.create({
      name: '공모전/채용 정보',
      slug: 'contest-job',
      description: '공모전 및 채용 정보',
      parentId: savedNotice.id,
      displayOrder: 1,
    });
    const savedContest = await categoryRepository.save(contest);

    // 공모전/채용 정보 하위 카테고리
    const contestSubCategories = [
      { name: '공모전 정보', slug: 'contest-info', description: '각종 공모전 정보', order: 1 },
      { name: '교육/활동/취업 정보', slug: 'education-job', description: '교육, 활동, 취업 관련 정보', order: 2 },
    ];

    for (const subCat of contestSubCategories) {
      await categoryRepository.save(categoryRepository.create({
        name: subCat.name,
        slug: subCat.slug,
        description: subCat.description,
        parentId: savedContest.id,
        displayOrder: subCat.order,
      }));
    }

    console.log('Categories seeded successfully');
  }
}
