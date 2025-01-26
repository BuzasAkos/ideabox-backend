import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserData } from './dto/user-data.dto';

@Injectable()
export class AuthService {

    constructor(
        private readonly jwtService: JwtService
    ) {}

    async authenticate(userData: UserData) {
        const { name } = userData;
        if (!name) {
            throw new HttpException('No valid user info received', HttpStatus.UNAUTHORIZED);
        }

        const token = this.jwtService.sign(
            { name },
            { secret: 'ideaBox25', expiresIn: '1h' }
        );
        return { token }
    }
}
