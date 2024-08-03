
import 'dotenv/config';
import {sign,verify} from 'jsonwebtoken';
import { TokenPayload, VerifyTokentype } from 'model/user.model';

export const generateAccessToken = (user: TokenPayload): string => {
    try {
        const secret = String(process.env.JWT_SECRET);
        
        const expiresIn = process.env.JWT_EXPIRES_IN || '1800s';
        
        const token = sign(user, secret, {
            expiresIn: expiresIn,
        });
            return token;
    } catch (error) {
        throw new Error('Failed to generate token');    }
};

export const verifyAccessToken = (token: string): VerifyTokentype => {
    let data: VerifyTokentype;

    try {
        const payload = verify(
            token,
            String(process.env.JWT_SECRET)
        );
        data = {
            payload,
            error: null,
        };

        return data;
    } catch (error: Error | unknown) {
        data = {
            payload: "",
            error: (error as Error).message,
        };

        return data;
    }
};