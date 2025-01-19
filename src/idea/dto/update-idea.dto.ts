import { PartialType } from '@nestjs/mapped-types';
import { CreateIdeaDto } from './create-idea.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateIdeaDto extends PartialType(CreateIdeaDto) {
    
    @IsOptional()
    @IsString()
    status?: string;
    
}
