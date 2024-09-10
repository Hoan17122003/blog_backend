import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    post_name: string;

    @IsString()
    @IsNotEmpty()
    post_content: string;

    // that property is unique constraint
    @IsNotEmpty()
    @IsNumber()
    category_name: string;

    @IsOptional()
    @IsString()
    tag_name?: string;
}
