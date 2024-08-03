

import { HttpException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { verifyAccessToken } from "src/utils/jwt";
import { NextFunction } from "express";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    async use(req: any, res: any, next: NextFunction) {
        try {
            console.log('Auth Middleware - Headers:', req.headers);
            const authorizationHeader = req.headers['authorization'] as string;

            if (!authorizationHeader) {
                throw new HttpException('Unauthorized: No token provided', HttpStatus.UNAUTHORIZED);
            }

            const token = authorizationHeader.replace('Bearer ', '');


            const { payload, error } = verifyAccessToken(token);

            if (error) {
                return res.status(403).json({ message: 'Invalid or expired token' });
            }

            req.user = payload;

            next();
        } catch (error) {
            console.error('Error in AuthMiddleware:', error); 
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
        }
    }

}