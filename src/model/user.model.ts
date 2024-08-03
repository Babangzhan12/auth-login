
import { JwtPayload } from "jsonwebtoken";

export class RegisterUserRequest {
    username: string;
    password: string;
    name: string;
    email: string;
}

export class UserResponse {
    username: string;
    name: string;
    role?: string;
    email?: string;
    token?: string;
}

export class LoginUserRequest {
    username: string;
    password: string;
}

export class UpdateUserRequest {
    name?: string;
    password?: string;
    email?: string;
    role?: string;
}

export class TokenPayload {
    username: string;
    name: string;
    email: string;
    role: string;
}

export class VerifyTokentype {
    payload: string | JwtPayload;
    error: Error | unknown | null;
}