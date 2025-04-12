import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserData} from './dto/user-data.dto';
import { CreateRoleDto } from 'src/idea/dto/create-role.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() userData: UserData) {
        return await this.authService.authenticate(userData);
    }

    @Post('role')
    async createRole(@Body() createRoleDto: CreateRoleDto) {
      return await this.authService.createRole(createRoleDto);
  }

}
