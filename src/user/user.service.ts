import { HttpException, Inject, Injectable } from "@nestjs/common";
import { ValidationService } from '../common/validation.service';
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from 'winston';
import { PrismaService } from '../common/prisma.service';
import { UserValidation } from "./user.validation";
import { LoginUserRequest, RegisterUserRequest, UserResponse } from "model/user.model";
import * as bcrypt from 'bcrypt';
import { TokenPayload } from '../model/user.model';
import { generateAccessToken } from "src/utils/jwt";

@Injectable()
export class UserService {
    constructor (
        private validationService: ValidationService,
        @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
        private prismaService: PrismaService,
    ) {}
    async register(request: RegisterUserRequest): Promise<UserResponse>{
        this.logger.info(`Register new user ${JSON.stringify(request)}`);
        const registerRequest: RegisterUserRequest = this.validationService.validate(UserValidation.REGISTER,request);

        const totalUserWithSameUsername = await this.prismaService.user.count({
            where: {
                username: registerRequest.username,
            },
        });

        if (totalUserWithSameUsername != 0) {
            throw new HttpException('Username Already exists', 400);
        }

        registerRequest.password = await bcrypt.hash(registerRequest.password,10);

        const user = await this.prismaService.user.create({
            data: registerRequest,
        });

        return {
            username: user.username,
            name: user.name,
        };
    }

    async login(request: LoginUserRequest): Promise<UserResponse>{
        this.logger.info(`UserService.login(${JSON.stringify(request)})`);
        const loginRequest: LoginUserRequest = this.validationService.validate(
            UserValidation.LOGIN,
            request,
        );

        const user = await this.prismaService.user.findUnique({
            where: {
                username: loginRequest.username
            }
        });

        if(!user){
            throw new HttpException('Username of password is invalid', 401);
        }

        const isPasswordValid = await bcrypt.compare(loginRequest.password, user.password);

        if (!isPasswordValid){
            throw new HttpException('Username of password is invalid', 401);
        }

        const tokenPayload: TokenPayload = {
            id: user.username,
            role: user.role,
        };

        const token = generateAccessToken(tokenPayload);

        return {
            username: user.username,
            name: user.name,
            role: user.role,
            token: token,
        };

        // user = await this.prismaService.user.update({
        //     where: {
        //         username: loginRequest.username
        //     },
        //     data: {
        //       token:
        //     }
        // });

        // return {
        //     username: user.username,
        //     name: user.name,
        //     token: user.token,
        // };
    }
}