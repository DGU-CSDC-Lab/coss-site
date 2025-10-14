import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SuccessResponse } from '@/common/dto/response.dto';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        // 페이지네이션 응답은 그대로 반환 (이미 완전한 형태)
        if (data && typeof data === 'object' && 'meta' in data) {
          return data;
        }

        // 일반 응답은 SuccessResponse로 래핑
        return new SuccessResponse(data);
      }),
    );
  }
}
