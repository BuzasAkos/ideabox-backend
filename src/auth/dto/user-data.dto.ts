import { IsString, IsNotEmpty, MaxLength, } from 'class-validator';

export class UserData {

    @IsNotEmpty()
    @IsString()
    @MaxLength(20)
    name: string;

}