import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { unknowProviders } from '../database/dynamic-provider';

import { Admin } from '../database/Entity/admin.entity';

@Module({
    imports: [DatabaseModule],
    providers: [unknowProviders('ADMINREPOSITORY', Admin)],
})
export class AdminModule {}
