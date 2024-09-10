import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { TagService } from './tag.service';
import { unknowProviders } from 'src/database/dynamic-provider';
import { Tag } from 'src/database/Entity/tag.entity';

@Module({
    imports: [DatabaseModule],
    providers: [unknowProviders('TAGREPOSITORY', Tag), TagService],
    exports: [TagService],
})
export class TagModule {}
