interface ApiError {
  code: string
  message: string
  details?: {
    validationErrors?: string[]
  }
  traceId?: string
}

const getStatusMessage = (status: number): string => {
  switch (status) {
    case 400:
      return '잘못된 요청입니다.'
    case 401:
      return '로그인이 필요합니다.'
    case 403:
      return '접근 권한이 없습니다.'
    case 404:
      return '요청한 정보를 찾을 수 없습니다.'
    case 422:
      return '입력한 정보를 확인해 주세요.'
    case 500:
      return '서버 오류가 발생했습니다.'
    default:
      return '오류가 발생했습니다.'
  }
}

export const getErrorMessage = (error: any): string => {
  if (error?.response?.data) {
    const apiError: ApiError = error.response.data

    if (apiError.details?.validationErrors?.length) {
      return apiError.details.validationErrors.join(', ')
    }

    if (apiError.message && apiError.message !== 'Validation failed') {
      return apiError.message
    }
  }

  if (error?.response?.status) {
    return getStatusMessage(error.response.status)
  }

  return error?.message || '네트워크 오류가 발생했습니다.'
}
