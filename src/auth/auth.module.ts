import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { DatabaseModule } from 'src/database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { dataSource } from 'src/database/database.providers';
import { User } from 'src/database/Entity/user.entity';

@Module({
    imports: [DatabaseModule, JwtModule.register({})],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtService,
        {
            provide: 'USER',
            useFactory: () => {
                return new UserService(dataSource.getRepository(User));
            },
        },
    ],
    exports: [AuthService],
})
export class AuthModule {}
