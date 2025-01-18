import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateIdeaDto {

    @IsNotEmpty()
    @IsString()
    @MaxLength(30)
    title: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    description?: string;

}
