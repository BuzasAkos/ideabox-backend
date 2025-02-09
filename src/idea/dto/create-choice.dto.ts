import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateChoiceDto {

    @IsNotEmpty()
    @IsString()
    field: string;

    @IsNotEmpty()
    @IsString()
    code: string;

    @IsNotEmpty()
    @IsString()
    displayName: string;

}

