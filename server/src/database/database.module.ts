import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseSeeder } from '@/database/database.seeder';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

// Import entities directly from domains
import {
  Account,
  User,
  PendingUser,
  PasswordResetToken,
} from '@/auth/entities';
import { BoardPost } from '@/board/entities';
import { AcademicSchedule } from '@/schedule/entities';
import { File } from '@/file/entities';
import { Popup } from '@/popup/entities';
import { FacultyMember } from '@/faculty/entities';
import { History } from '@/history/entities';
import { CourseMaster, CourseOffering } from '@/course/entities';
import { Category } from '@/category/entities';
import { HeaderAsset } from '@/header-asset/entities';
import { Feedback } from '@/feedback/entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        let username = configService.get('DB_USERNAME');
        let password = configService.get('DB_PASSWORD');

        // AWS Secrets Manager에서 자격 증명 가져오기
        const secretName = configService.get('AWS_SECRET_NAME');
        if (secretName) {
          try {
            const client = new SecretsManagerClient({
              region: configService.get('AWS_REGION') || 'ap-northeast-2',
            });
            const response = await client.send(
              new GetSecretValueCommand({ SecretId: secretName }),
            );
            const secret = JSON.parse(response.SecretString);
            username = secret.username;
            password = secret.password;
          } catch (error) {
            console.warn('Failed to fetch from Secrets Manager:', error.message);
          }
        }

        return {
          type: 'mysql',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username,
          password,
          database: configService.get('DB_DATABASE'),
          charset: 'utf8mb4',
          entities: [
            Account,
            User,
            PendingUser,
            PasswordResetToken,
            BoardPost,
            AcademicSchedule,
            File,
            Popup,
            FacultyMember,
            Feedback,
            History,
            CourseMaster,
            CourseOffering,
            Category,
            HeaderAsset,
          ],
          synchronize: process.env.NODE_ENV !== 'production',
          logging:
            process.env.NODE_ENV === 'production' ? ['error', 'warn'] : true,
          dropSchema: false,
        };
      },
    }),
  ],
  providers: [DatabaseSeeder],
})
export class DatabaseModule {}
