import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { map, Observable, tap } from 'rxjs';
import { Cache } from 'cache-manager';

@Injectable()
export class LoggingPost implements NestInterceptor {
    constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        return next.handle().pipe(
            tap(() => {
                const date = new Date(Date.now()).toLocaleDateString('vi');
                const request = context.switchToHttp().getRequest();
                const { post } = request.body;
                const user_id = request.session.user_id;
                const cache = this.cacheManager.set(
                    `admin_browse-articles`,
                    JSON.stringify(`admin(${user_id}) - time : ${date} - StatePost:${post.state}`),
                );
                return console.log(`admin_browse-articles_${user_id}-time: ${new Date()} - StatePost:${post.state} `);
            }),
        );
    }
}
