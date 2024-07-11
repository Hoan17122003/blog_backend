import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { JwtModule, JwtService } from '@nestjs/jwt';

import { unknowProviders } from 'src/database/dynamic-provider';
import { User } from 'src/database/Entity/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MailModule } from 'src/mail/mail.module';

@Global()
@Module({
    imports: [DatabaseModule, MailModule, JwtModule.register({})],
    providers: [unknowProviders('USERREPOSITORY', User), UserService, JwtService],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule {}
