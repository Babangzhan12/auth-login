
import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ValidationService } from '../common/validation.service';
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from 'winston';
import { PrismaService } from '../common/prisma.service';
import { UserValidation } from "./user.validation";
import { LoginUserRequest, RegisterUserRequest, UpdateUserRequest, UserResponse } from "model/user.model";
import * as bcrypt from 'bcrypt';
import { TokenPayload } from '../model/user.model';
import { generateAccessToken } from "src/utils/jwt";
import { User } from "@prisma/client";

@Injectable()
export class UserService {
    constructor(
        private validationService: ValidationService,
        @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
        private prismaService: PrismaService,
    ) { }
    async register(request: RegisterUserRequest): Promise<UserResponse> {
        this.logger.debug(`Register new user ${JSON.stringify(request)}`);
        const registerRequest: RegisterUserRequest = this.validationService.validate(UserValidation.REGISTER, request);

        const totalUserWithSameUsername = await this.prismaService.user.count({
            where: {
                username: registerRequest.username,
            },
        });

        if (totalUserWithSameUsername != 0) {
            throw new HttpException('Username Already exists', 400);
        }

        registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

        if (!registerRequest.email) {
            throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
        }

        this.logger.info('Creating user with data:', registerRequest);
        const user = await this.prismaService.user.create({
            data: {
                username: registerRequest.username,
                password: registerRequest.password,
                name: registerRequest.name,
                email: registerRequest.email,
            },
        });
        this.logger.info('User created:', user);

        return {
            username: user.username,
            name: user.name,
            email: user.email
        };
    }

    async login(request: LoginUserRequest): Promise<UserResponse> {
        this.logger.debug(`UserService.login(${JSON.stringify(request)})`);
        const loginRequest: LoginUserRequest = this.validationService.validate(
            UserValidation.LOGIN,
            request,
        );

        const user = await this.prismaService.user.findUnique({
            where: {
                username: loginRequest.username
            }
        });

        if (!user) {
            throw new HttpException('Username of password is invalid', 401);
        }

        const isPasswordValid = await bcrypt.compare(loginRequest.password, user.password);

        if (!isPasswordValid) {
            throw new HttpException('Username of password is invalid', 401);
        }

        const tokenPayload: TokenPayload = {
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        const token = generateAccessToken(tokenPayload);

        return {
            username: user.username,
            name: user.name,
            role: user.role,
            email: user.email,
            token: token,
        };
    }

    async get(user: User): Promise<UserResponse> {
        console.log('User service :', user);
        const checkUser = await this.prismaService.user.findUnique({
            where: { username: user.username },
        });
        if (!checkUser) {
            throw new BadRequestException('User not found');
        }
        return {
            username: checkUser.username,
            name: checkUser.name,
            email: checkUser.email,
            role: checkUser.role,
        };
    }

    async update(user: User, request: UpdateUserRequest): Promise<UserResponse> {
        this.logger.debug(`UserService.update(${JSON.stringify(user)} , ${JSON.stringify(request)})`);

        const updateRequest = this.validationService.validate(UserValidation.UPDATE, request);

        const checkUser = await this.prismaService.user.findUnique({
            where: { username: user.username },
        });

        if (!checkUser) {
            throw new BadRequestException('User not found');
        }

        const updatedData: Partial<User> = {};

        if (updateRequest.name) {
            updatedData.name = updateRequest.name;
        }
        if (updateRequest.password) {
            updatedData.password = await bcrypt.hash(updateRequest.password, 10);
        }
        if (updateRequest.email) {
            updatedData.email = updateRequest.email;
        }
        if (updateRequest.role) {
            updatedData.role = updateRequest.role;
        }

        const result = await this.prismaService.user.update({
            where: {
                username: user.username,
            },
            data: updatedData,
        });

        this.logger.debug(`Update result: ${JSON.stringify(result)}`);

        return {
            username: result.username,
            name: result.name,
            email: result.email,
            role: result.role,
        }
    }

    async delete(user: User, username: string): Promise<void> {
        this.logger.debug(`UserService.delete(${username})`);

        if (user.role !== 'ADMIN' ) {
            throw new ForbiddenException('Access denied');
        }

        const check = await this.prismaService.user.findUnique({
            where: { username },
        });

        if (!check) {
            throw new BadRequestException('User not found');
        }

        await this.prismaService.user.delete({
            where: { username },
        });

        this.logger.debug(`User with username ${username} deleted successfully`);
    }
}