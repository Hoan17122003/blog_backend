import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Query,
    Session,
    UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { JwtAccessAuth } from 'src/auth/guard/JwtAccess.guard';
import { Roles } from 'src/auth/decorator/role.decorator';
import { RolesGuard } from 'src/auth/guard/Role.guard';

@UseGuards(JwtAccessAuth)
@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Roles('admin')
    @UseGuards(RolesGuard)
    @Post('create')
    async Create(@Body('category_name') category_name: string) {
        try {
            const category = await this.categoryService.create(category_name);
            return { message: 'Category created successfully', statusCode: HttpStatus.OK, data: category };
        } catch (error) {
            throw new ForbiddenException('');
        }
    }

    @Get('fillter')
    async FillterPost(
        @Query('q') categoryName: string,
        @Query('flag') flag: string,
        @Session() session: Record<string, any>,
    ) {
        try {
            const user_id = session.user_id;
            return this.categoryService.fillterPost(categoryName, user_id, flag);
        } catch (error) {}
    }
}
