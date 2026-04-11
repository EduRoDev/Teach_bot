import { BadRequestException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInterface, UpdateUserInterface } from './interfaces';
import { BcryptService } from '../auth/bcrypt/bcrypt.service';

@Injectable()
export class UsersService {
    private readonly logger = new Logger('App - Modules: users');


    constructor(
        private readonly prisma: PrismaService,
        private readonly bcryptService: BcryptService
    ) { }


    private async validateEmail(email: string) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
            select: { email: true }
        })

        if (existingUser) {
            this.logger.warn('User with email already exists:', email);
            throw new BadRequestException("User with this email already exists");
        }
    }

    async create({
        name,
        lastName,
        avatar,
        email,
        backupEmail,
        phone,
        password,
        country,
        emailConfirm,
        backupEmailConfirm,
        phoneConfirm,
        twoFactorEnabled,
        twoFactorSecret,
        status,
        authProvider,
        role
    }: CreateUserInterface) {

        if (!password) {
            this.logger.warn('Password is required for user creation:', email);
            throw new BadRequestException("Password is required");
        }

        await this.validateEmail(email);

        const user = await this.prisma.user.create({
            data: {
                name,
                lastName,
                avatar,
                email,
                backupEmail,
                phone,
                password: await this.bcryptService.hash(password),
                country,
                emailConfirm,
                backupEmailConfirm,
                phoneConfirm,
                twoFactorEnabled,
                twoFactorSecret,
                status,
                authProvider,
                role
            }
        })

        return user;
    }


    async findOne(id?: number, email?: string) {
        const user = await this.prisma.user.findUnique({
            where: { id, email }
        })
        if (!user) throw new NotFoundException("User not found");
        return user;
    }


    async update({ id, password, email, ...data }: UpdateUserInterface) {
        await this.findOne(id);

        if (email) await this.validateEmail(email);

        return await this.prisma.user.update({
            where: { id },
            data: {
                ...data,
                password: password && (await this.bcryptService.hash(password)),
                email: email && email
            }
        })

    }

    async delete(id: number) {
        await this.findOne(id);
        await this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date() }
        })
    }
}
