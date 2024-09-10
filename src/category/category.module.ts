import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { unknowProviders } from 'src/database/dynamic-provider';
import { Category } from 'src/database/Entity/category.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [DatabaseModule, JwtModule.register({})],
    providers: [unknowProviders('CATEGORYREPOSITORY', Category), CategoryService],
    controllers: [CategoryController],
    exports: [CategoryService],
})
export class CategoryModule {}
