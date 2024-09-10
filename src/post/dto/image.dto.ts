import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export default class ImageDTO {
    @IsString()
    @IsNotEmpty()
    url: string;

    @IsNumber()
    @IsNotEmpty()
    position: number;
}
