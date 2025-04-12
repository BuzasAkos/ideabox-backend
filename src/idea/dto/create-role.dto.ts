import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class CreateRoleDto {

    @IsNotEmpty()
    @IsString()
    userName: string;

    @IsArray()
    userRoles: string[];

}
