import { HttpStatus } from '@nestjs/common';

export interface ApiErrorResponse {
  code: string;
  message: string;
  httpStatus: HttpStatus;
}

// ===== 공통 HTTP 에러 =====
export const COMMON_ERRORS = {
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    message: '잘못된 요청입니다.',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: '인증되지 않았습니다.',
    httpStatus: HttpStatus.UNAUTHORIZED,
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: '접근 권한이 없습니다.',
    httpStatus: HttpStatus.FORBIDDEN,
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: '찾을 수 없습니다.',
    httpStatus: HttpStatus.NOT_FOUND,
  },
  CONFLICT: {
    code: 'CONFLICT',
    message: '충돌이 발생했습니다.',
    httpStatus: HttpStatus.CONFLICT,
  },
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    message: '서버 내부 오류가 발생했습니다.',
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: '유효성 검사에 실패했습니다.',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
} as const;

// ===== 데이터베이스 에러 =====
export const DATABASE_ERRORS = {
  DB_CONNECTION_ERROR: {
    code: 'DB_CONNECTION_ERROR',
    message: '데이터베이스 연결에 실패했습니다.',
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  DB_QUERY_ERROR: {
    code: 'DB_QUERY_ERROR',
    message: '데이터베이스 쿼리 실행에 실패했습니다.',
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
  },
} as const;

// ===== 인증/권한 도메인 에러 =====
export const AUTH_ERRORS = {
  NOT_FOUND_USER: {
    code: 'NOT_FOUND_USER',
    message: '존재하지 않는 사용자입니다.',
    httpStatus: HttpStatus.NOT_FOUND,
  },
  INVALID_EMAIL_FORMAT: {
    code: 'INVALID_EMAIL_FORMAT',
    message: '이메일 형식이 일치하지 않습니다.',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  NOT_FOUND_EMAIL: {
    code: 'NOT_FOUND_EMAIL',
    message: '존재하지 않는 이메일입니다.',
    httpStatus: HttpStatus.NOT_FOUND,
  },
  EMAIL_ALREADY_EXISTS: {
    code: 'EMAIL_ALREADY_EXISTS',
    message: '이미 존재하는 이메일입니다.',
    httpStatus: HttpStatus.CONFLICT,
  },
  MISMATCH_PASSWORD: {
    code: 'MISMATCH_PASSWORD',
    message: '비밀번호가 일치하지 않습니다.',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  IS_SAME_PASSWORD: {
    code: 'IS_SAME_PASSWORD',
    message: '새 비밀번호는 기존 비밀번호와 같을 수 없습니다.',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  IS_NOT_ADMIN: {
    code: 'IS_NOT_ADMIN',
    message: '관리자 권한이 필요합니다.',
    httpStatus: HttpStatus.FORBIDDEN,
  },
  MISMATCH_CODE: {
    code: 'MISMATCH_CODE',
    message: '인증번호가 일치하지 않습니다.',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  EXPIRED_CODE: {
    code: 'EXPIRED_CODE',
    message: '인증번호가 만료되었습니다.',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  FAILED_CODE_SEND: {
    code: 'FAILED_CODE_SEND',
    message: '인증번호 발송에 실패했습니다.',
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  NOT_FOUND_CODE: {
    code: 'NOT_FOUND_CODE',
    message: '인증번호가 존재하지 않습니다.',
    httpStatus: HttpStatus.NOT_FOUND,
  },
  FAILED_CODE_VERIFY: {
    code: 'FAILED_CODE_VERIFY',
    message: '인증번호 검증에 실패했습니다.',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
} as const;

// ===== 게시판 도메인 에러 =====
export const POST_ERRORS = {
  POST_NOT_FOUND: {
    code: 'POST_NOT_FOUND',
    message: '게시글을 찾을 수 없습니다.',
    httpStatus: HttpStatus.NOT_FOUND,
  },
} as const;

// ===== 카테고리 도메인 에러 =====
export const CATEGORY_ERRORS = {
  CATEGORY_NOT_FOUND: {
    code: 'CATEGORY_NOT_FOUND',
    message: '카테고리를 찾을 수 없습니다.',
    httpStatus: HttpStatus.NOT_FOUND,
  },
  CATEGORY_ALREADY_EXISTS: {
    code: 'CATEGORY_ALREADY_EXISTS',
    message: '이미 존재하는 카테고리입니다.',
    httpStatus: HttpStatus.CONFLICT,
  },
  PARENT_CATEGORY_NOT_FOUND: {
    code: 'PARENT_CATEGORY_NOT_FOUND',
    message: '부모 카테고리를 찾을 수 없습니다.',
    httpStatus: HttpStatus.NOT_FOUND,
  },
  IS_EXISTING_SUBCATEGORY: {
    code: 'IS_EXISTING_SUBCATEGORY',
    message: '하위 카테고리가 존재하는 카테고리는 삭제할 수 없습니다.',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
} as const;

// ===== 팝업 도메인 에러 =====
export const POPUP_ERRORS = {
  POPUP_NOT_FOUND: {
    code: 'POPUP_NOT_FOUND',
    message: 'Popup not found',
    httpStatus: HttpStatus.NOT_FOUND,
  },
  POPUP_ALREADY_EXISTS: {
    code: 'POPUP_ALREADY_EXISTS',
    message: 'Popup with this title already exists',
    httpStatus: HttpStatus.CONFLICT,
  },
} as const;

// ===== 파일 도메인 에러 =====
export const FILE_ERRORS = {
  INVALID_MIME_TYPE: {
    code: 'INVALID_MIME_TYPE',
    message: '업로드 할 수 없는 파일 타입입니다.',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  EXPIRED_PRESIGNED_URL: {
    code: 'EXPIRED_PRESIGNED_URL',
    message: 'Presigned URL이 만료되었습니다.',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  TO_HIGH_FILE_SIZE: {
    code: 'TO_HIGH_FILE_SIZE',
    message: '파일 크기가 너무 큽니다. 파일 크기는 10MB를 넘을 수 없습니다.',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  FAILED_CREATE_S3_CLIENT: {
    code: 'FAILED_CREATE_S3_CLIENT',
    message: 'S3 클라이언트 생성에 실패했습니다.',
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  FAILED_GENERATE_PRESIGNED_URL: {
    code: 'FAILED_GENERATE_PRESIGNED_URL',
    message: 'Presigned URL 생성에 실패했습니다.',
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  FILE_NOT_FOUND: {
    code: 'FILE_NOT_FOUND',
    message: '파일을 찾을 수 없습니다.',
    httpStatus: HttpStatus.NOT_FOUND,
  },
  FAILED_PUT_OBJECT_TO_S3: {
    code: 'FAILED_PUT_OBJECT_TO_S3',
    message: 'S3 객체 업로드에 실패했습니다.',
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  FAILED_DELETE_S3_OBJECT: {
    code: 'FAILED_DELETE_S3_OBJECT',
    message: 'S3 객체 삭제에 실패했습니다.',
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
  },
} as const;

// ===== 강의 도메인 에러 =====
export const COURSE_ERRORS = {
  COURSE_NOT_FOUND: {
    code: 'COURSE_NOT_FOUND',
    message: 'Course not found',
    httpStatus: HttpStatus.NOT_FOUND,
  },
  AVAILABLE_ONLY_CSV_FORMAT: {
    code: 'AVAILABLE_ONLY_CSV_FORMAT',
    message: 'CSV 형식의 파일만 업로드할 수 있습니다.',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  MORE_THAN_ONE_HEADER_ROW: {
    code: 'MUST_BE_ONE_HEADER_ROW',
    message: '헤더 행이 하나 이상이어야 합니다. 합니다.',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
} as const;

// ===== 교수진 도메인 에러 =====
export const FACULTY_ERRORS = {
  FACULTY_NOT_FOUND: {
    code: 'FACULTY_NOT_FOUND',
    message: '해당하는 교수를 찾을 수 없습니다.',
    httpStatus: HttpStatus.NOT_FOUND,
  },
} as const;

// ===== 일정 도메인 에러 =====
export const SCHEDULE_ERRORS = {
  SCHEDULE_NOT_FOUND: {
    code: 'SCHEDULE_NOT_FOUND',
    message: '해당하는 일정을 찾을 수 없습니다.',
    httpStatus: HttpStatus.NOT_FOUND,
  },
} as const;

// ===== 히스토리 도메인 에러 =====
export const HISTORY_ERRORS = {
  HISTORY_NOT_FOUND: {
    code: 'HISTORY_NOT_FOUND',
    message: '해당하는 연혁을 찾을 수 없습니다.',
    httpStatus: HttpStatus.NOT_FOUND,
  },
} as const;

// ===== 헤더 에셋 도메인 에러 =====
export const HEADER_ASSET_ERRORS = {
  HEADER_ASSET_NOT_FOUND: {
    code: 'HEADER_ASSET_NOT_FOUND',
    message: '헤더 에셋을 찾을 수 없습니다.',
    httpStatus: HttpStatus.NOT_FOUND,
  },
} as const;
