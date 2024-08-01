import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from './user.service';
import { LoginUserRequest, RegisterUserRequest, UserResponse } from "model/user.model";
import { WebResponse } from 'model/web.model';




@Controller('/api/users')
export class UserController {
    
    constructor(private userService: UserService){}

    @Post()
    async register(@Body() request: RegisterUserRequest): Promise<WebResponse<UserResponse>> {
        const result = await this.userService.register(request);
        return {
            data: result,
        };
    }

    @Post('/login')
    async login(@Body() request: LoginUserRequest): Promise<WebResponse<UserResponse>> {
        const result = await this.userService.login(request);
        return {
            data: result,
        };
    }
}