
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import { UserService } from './user.service';
import { LoginUserRequest, RegisterUserRequest, UpdateUserRequest, UserResponse } from "model/user.model";
import { WebResponse } from 'model/web.model';
import { Auth, Roles } from "src/common/auth.decorator";
import { User } from "@prisma/client";


@Controller('/api/users')
export class UserController {

    constructor(private userService: UserService) { }

    @Post()
    async register(@Body() request: RegisterUserRequest): Promise<WebResponse<UserResponse>> {
        try {
            const result = await this.userService.register(request);
            return {
                data: result,
            };
        } catch (error: Error | unknown) {
            throw new Error((error as Error).message)
        }
    }

    @Post('/login')
    async login(@Body() request: LoginUserRequest): Promise<WebResponse<UserResponse>> {
        const result = await this.userService.login(request);
        return {
            data: result,
        };
    }

    @Get('/current')
    @Roles('USER','ADMIN')
    async get(@Auth() user: User): Promise<WebResponse<UserResponse>> {
        const result = await this.userService.get(user);
        return {
            data: result,
        };
    }

    @Patch('/current')
    @Roles('USER','ADMIN')
    async update(@Auth() user: User, @Body() request: UpdateUserRequest): Promise<WebResponse<UserResponse>> {
        try {
            const result = await this.userService.update(user, request);
            return {
                data: result,
            };
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Delete('/:username')
    @Roles('ADMIN')
    async delete(@Param('username') username: string,@Auth() user: User): Promise<void> {
        try {
             await this.userService.delete(user,username);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }
}