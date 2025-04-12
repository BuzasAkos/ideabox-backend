import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserData } from './dto/user-data.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, WithoutId } from 'typeorm';
import { Role } from 'src/idea/entities/role.entity';
import { CreateRoleDto } from 'src/idea/dto/create-role.dto';

@Injectable()
export class AuthService {

    constructor(
        private readonly jwtService: JwtService,
        @InjectRepository(Role)
        private roleRepository: MongoRepository<Role>,
    ) {}

    async authenticate(userData: UserData) {
        const { name } = userData;
        if (!name) {
            throw new HttpException('No valid user info received', HttpStatus.UNAUTHORIZED);
        }

        const roles = (await this.getRoleByUser(name)).join(', ');
        const token = this.jwtService.sign(
            { name, roles },
            { secret: 'ideaBox25', expiresIn: '1h' }
        );
        return { token }
    }

    async createRole(createRoleDto: CreateRoleDto) {
        const { userName, userRoles } = createRoleDto;
        const now = new Date();

        const existingRole = await this.roleRepository.findOne({where: {boolId: true, userName: userName}});
        if (existingRole) {
            existingRole.modifiedAt = now;
            existingRole.boolId = false;
            this.roleRepository.save(existingRole);
        }

        const role: WithoutId<Role> = {
            userName,
            userRoles,
            createdAt: now,
            modifiedAt: now,
            boolId: true
        }
        return await this.roleRepository.save(role);
    }

    async getRoleByUser(userName: string) {
        const role = await this.roleRepository.findOne({where: {boolId: true, userName: userName}});
        if (!role) return []
        return role.userRoles;
    }
}
