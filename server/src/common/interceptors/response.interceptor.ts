import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        // If data is already formatted (has meta property for pagination), return as is
        if (data && typeof data === 'object' && 'meta' in data) {
          return data;
        }

        // For simple responses, return as is
        return data;
      }),
    );
  }
}
