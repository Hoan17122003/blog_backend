import {
    Injectable,
    ExecutionContext,
    NestInterceptor,
    CallHandler,
    HttpStatus,
    ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { map, Observable, tap } from 'rxjs';

@Injectable()
export class ValidateToKenInterceptor implements NestInterceptor {
    constructor(private readonly jwtService: JwtService) {}

    async intercept(
        context: ExecutionContext,
        next: CallHandler<any>,
    ): Promise<Observable<any>> | Promise<Observable<any>> {
        const requests = context.switchToHttp().getRequest();
        const valueToken = requests.Body;
        const validateToken = await this.jwtService.verifyAsync(valueToken.validateToken, {
            secret: process.env.VALIDATESECRET,
        });
        const token = valueToken.token;

        if (validateToken != token) throw new ForbiddenException('mã xác thực không chính xác');
        

        return next.handle().pipe(
            map((data) => ({
                data,
                statuscode: HttpStatus.OK,
                message: 'validate success ok',
            })),
        );
    }
}
