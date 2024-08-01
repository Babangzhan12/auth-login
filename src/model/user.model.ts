import { JwtPayload } from "jsonwebtoken";

export class RegisterUserRequest {
    username: string;
    password: string;
    name: string;
}

export class UserResponse {
    username: string;
    name: string;
    role?: string;
    token?: string;
}

export class LoginUserRequest {
    username: string;
    password: string;
}

export class TokenPayload {
    id: string;
    role: string;
}

export class VerifyTokentype {
    payload: string | JwtPayload;
    error: Error | unknown | null;
}