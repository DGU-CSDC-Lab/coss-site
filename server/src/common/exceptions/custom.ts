import { HttpException } from '@nestjs/common';
import { ErrorResponse } from '@/common/dto/response.dto';
import {
  ApiErrorResponse,
  COMMON_ERRORS,
  DATABASE_ERRORS,
  AUTH_ERRORS,
  POST_ERRORS,
  POPUP_ERRORS,
  FILE_ERRORS,
  COURSE_ERRORS,
  FACULTY_ERRORS,
  SCHEDULE_ERRORS,
  CATEGORY_ERRORS,
  HISTORY_ERRORS,
  HEADER_ASSET_ERRORS,
} from '@/common/exceptions/responses';
import { UserRole } from '@/auth/entities';

class BaseDomainException extends HttpException {
  constructor(errorResponse: ApiErrorResponse, details?: Record<string, any>) {
    const response = new ErrorResponse(
      errorResponse.code,
      errorResponse.message,
      details,
    );
    super(response, errorResponse.httpStatus);
  }
}

// ===== 공통 HTTP Exception =====
export class CommonException extends BaseDomainException {
  static badRequest(message?: string, details?: Record<string, any>) {
    const error = message
      ? { ...COMMON_ERRORS.BAD_REQUEST, message }
      : COMMON_ERRORS.BAD_REQUEST;
    return new CommonException(error, details);
  }

  static unauthorized(message?: string, details?: Record<string, any>) {
    const error = message
      ? { ...COMMON_ERRORS.UNAUTHORIZED, message }
      : COMMON_ERRORS.UNAUTHORIZED;
    return new CommonException(error, details);
  }

  static forbidden(message?: string, details?: Record<string, any>) {
    const error = message
      ? { ...COMMON_ERRORS.FORBIDDEN, message }
      : COMMON_ERRORS.FORBIDDEN;
    return new CommonException(error, details);
  }

  static notFound(message?: string, details?: Record<string, any>) {
    const error = message
      ? { ...COMMON_ERRORS.NOT_FOUND, message }
      : COMMON_ERRORS.NOT_FOUND;
    return new CommonException(error, details);
  }

  static conflict(message?: string, details?: Record<string, any>) {
    const error = message
      ? { ...COMMON_ERRORS.CONFLICT, message }
      : COMMON_ERRORS.CONFLICT;
    return new CommonException(error, details);
  }

  static internalServerError(message?: string, details?: Record<string, any>) {
    const error = message
      ? { ...COMMON_ERRORS.INTERNAL_SERVER_ERROR, message }
      : COMMON_ERRORS.INTERNAL_SERVER_ERROR;
    return new CommonException(error, details);
  }

  static validationError(field?: string, reason?: string, value?: any) {
    const details = field ? { field, reason, value } : undefined;
    return new CommonException(COMMON_ERRORS.VALIDATION_ERROR, details);
  }
}

// ===== 데이터베이스 에러 Exception =====
export class DatabaseException extends BaseDomainException {
  static connectionError(reason?: string) {
    const details = reason ? { reason } : undefined;
    return new DatabaseException(DATABASE_ERRORS.DB_CONNECTION_ERROR, details);
  }

  static queryError(reason?: string) {
    const details = reason ? { reason } : undefined;
    return new DatabaseException(DATABASE_ERRORS.DB_QUERY_ERROR, details);
  }
}

// ===== 인증/권한 도메인 Exception =====
export class AuthException extends BaseDomainException {
  static notFoundUser(userId?: string) {
    return new AuthException(
      AUTH_ERRORS.NOT_FOUND_USER,
      userId ? { userId } : undefined,
    );
  }

  static refreshTokenExpired() { 
    return new AuthException(AUTH_ERRORS.REFRESH_TOKEN_EXPIRED);
  }

  static invalidToken() {
    return new AuthException(AUTH_ERRORS.INVALID_TOKEN);
  }

  static invalidEmailFormat(email: string) {
    return new AuthException(AUTH_ERRORS.INVALID_EMAIL_FORMAT, { email });
  }

  static notFoundEmail(email: string) {
    return new AuthException(AUTH_ERRORS.NOT_FOUND_EMAIL, { email });
  }

  static emailAlreadyExists(email: string) {
    return new AuthException(AUTH_ERRORS.EMAIL_ALREADY_EXISTS, { email });
  }

  static mismatchPassword() {
    return new AuthException(AUTH_ERRORS.MISMATCH_PASSWORD);
  }

  static isSamePassword() {
    return new AuthException(AUTH_ERRORS.IS_SAME_PASSWORD);
  }

  static isNotAdmin(userRole?: string) {
    return new AuthException(
      AUTH_ERRORS.IS_NOT_ADMIN,
      userRole == UserRole.ADMIN ? { userRole } : undefined,
    );
  }

  static isNotSuperAdmin(userRole?: string) {
    return new AuthException(
      AUTH_ERRORS.IS_NOT_ADMIN,
      userRole == UserRole.SUPER_ADMIN ? { userRole } : undefined,
    );
  }

  static mismatchCode(code: string) {
    return new AuthException(AUTH_ERRORS.MISMATCH_CODE, { code });
  }

  static expiredCode(code: string) {
    return new AuthException(AUTH_ERRORS.EXPIRED_CODE, { code });
  }

  static failedCodeSend(email: string, reason?: string) {
    return new AuthException(AUTH_ERRORS.FAILED_CODE_SEND, { email, reason });
  }

  static notFoundCode(code: string) {
    return new AuthException(AUTH_ERRORS.NOT_FOUND_CODE, { code });
  }

  static failedCodeVerify(code: string, reason?: string) {
    return new AuthException(AUTH_ERRORS.FAILED_CODE_VERIFY, { code, reason });
  }

  static invalidVerificationCode() {
    return new AuthException(AUTH_ERRORS.MISMATCH_CODE);
  }

  static verificationCodeExpired() {
    return new AuthException(AUTH_ERRORS.EXPIRED_CODE);
  }

  static cannotDeleteSelf() {
    return new AuthException(AUTH_ERRORS.CANNOT_DELETE_SELF);
  }

  static cannotDeleteSuperAdmin() {
    return new AuthException(AUTH_ERRORS.CANNOT_DELETE_SUPER_ADMIN);
  }

  static cannotUpdateSelf() {
    return new AuthException(AUTH_ERRORS.CANNOT_UPDATE_SELF);
  }

  static insufficientPermissions() {
    return new AuthException(AUTH_ERRORS.INSUFFICIENT_PERMISSIONS);
  }
}

// ===== 게시판 도메인 Exception =====
export class PostException extends BaseDomainException {
  static postNotFound(postId: string) {
    return new PostException(POST_ERRORS.POST_NOT_FOUND, { postId });
  }

  static categoryNotFound(categoryId: string) {
    return new PostException(CATEGORY_ERRORS.CATEGORY_NOT_FOUND, {
      categoryId,
    });
  }
}

// ====== 카테고리 도메인 Exception =====
export class CategoryException extends BaseDomainException {
  static categoryNotFound(categoryId: string) {
    return new CategoryException(CATEGORY_ERRORS.CATEGORY_NOT_FOUND, {
      categoryId,
    });
  }

  static parentCategoryNotFound(parentId: string) {
    return new CategoryException(CATEGORY_ERRORS.PARENT_CATEGORY_NOT_FOUND, {
      parentId,
    });
  }

  static categoryAlreadyExists(name: string) {
    return new CategoryException(CATEGORY_ERRORS.CATEGORY_ALREADY_EXISTS, {
      name,
    });
  }

  static isExistingSubcategory() {
    return new CategoryException(CATEGORY_ERRORS.IS_EXISTING_SUBCATEGORY);
  }
}

// ===== 팝업 도메인 Exception =====
export class PopupException extends BaseDomainException {
  static popupNotFound(popupId: string) {
    return new PopupException(POPUP_ERRORS.POPUP_NOT_FOUND, { popupId });
  }
}

// ===== 히스토리 도메인 Exception =====
export class HistoryException extends BaseDomainException {
  static historyNotFound(historyId: string) {
    return new HistoryException(HISTORY_ERRORS.HISTORY_NOT_FOUND, {
      historyId,
    });
  }
}

// ===== 파일 도메인 Exception =====
export class FileException extends BaseDomainException {
  static invalidMimeType(mimeType: string) {
    return new FileException(FILE_ERRORS.INVALID_MIME_TYPE, { mimeType });
  }

  static toHighFileSize(fileSize: number) {
    return new FileException(FILE_ERRORS.TO_HIGH_FILE_SIZE, { fileSize });
  }

  static failedCreateS3Client(reason?: string) {
    return new FileException(
      FILE_ERRORS.FAILED_CREATE_S3_CLIENT,
      reason ? { reason } : undefined,
    );
  }

  static failedGeneratePresignedUrl(reason?: string) {
    return new FileException(
      FILE_ERRORS.FAILED_GENERATE_PRESIGNED_URL,
      reason ? { reason } : undefined,
    );
  }

  static fileNotFound(fileId?: string, fileKey?: string) {
    const details = fileId ? { fileId } : fileKey ? { fileKey } : undefined;
    return new FileException(FILE_ERRORS.FILE_NOT_FOUND, details);
  }

  static failedPutObjectToS3(reason?: string) {
    return new FileException(
      FILE_ERRORS.FAILED_PUT_OBJECT_TO_S3,
      reason ? { reason } : undefined,
    );
  }

  static failedDeleteS3Object(reason?: string) {
    return new FileException(
      FILE_ERRORS.FAILED_DELETE_S3_OBJECT,
      reason ? { reason } : undefined,
    );
  }
}

// ===== 강의 도메인 Exception =====
export class CourseException extends BaseDomainException {
  static courseNotFound(courseId: string) {
    return new CourseException(COURSE_ERRORS.COURSE_NOT_FOUND, { courseId });
  }

  static courseMasterNotFound(masterId: string) {
    return new CourseException(COURSE_ERRORS.COURSE_MASTER_NOT_FOUND, {
      masterId,
    });
  }

  static availableOnlyCsvFormat() {
    return new CourseException(COURSE_ERRORS.AVAILABLE_ONLY_CSV_FORMAT);
  }

  static moreThanOneHeaderRow() {
    return new CourseException(COURSE_ERRORS.MORE_THAN_ONE_HEADER_ROW);
  }

  static fileNotProvided() {
    return new CourseException(COURSE_ERRORS.FILE_NOT_PROVIDED);
  }

  static invalidFileType(type: string) {
    return new CourseException(COURSE_ERRORS.INVALID_FILE_TYPE, { type });
  }
}

// ===== 교수진 도메인 Exception =====
export class FacultyException extends BaseDomainException {
  static facultyNotFound(facultyId: string) {
    return new FacultyException(FACULTY_ERRORS.FACULTY_NOT_FOUND, {
      facultyId,
    });
  }
}

// ===== 일정 도메인 Exception =====
export class ScheduleException extends BaseDomainException {
  static scheduleNotFound(scheduleId: string) {
    return new ScheduleException(SCHEDULE_ERRORS.SCHEDULE_NOT_FOUND, {
      scheduleId,
    });
  }
}

// ===== 헤더 에셋 도메인 Exception =====
export class HeaderAssetException extends BaseDomainException {
  static headerAssetNotFound(assetId: string) {
    return new HeaderAssetException(
      HEADER_ASSET_ERRORS.HEADER_ASSET_NOT_FOUND,
      { assetId },
    );
  }
}
