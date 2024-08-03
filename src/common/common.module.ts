
import { Global, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { PrismaService } from './prisma.service';
import { ValidationService } from './validation.service';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ErrorFilter } from './error.filter';
import { AuthMiddleware } from './auth.middleware';
import { RolesGuard } from './roles.guard';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        WinstonModule.forRoot({
            format: winston.format.json(),
            transports: [new winston.transports.Console()],
        }),
    ],
    providers: [PrismaService, ValidationService, RolesGuard, {
        provide: APP_FILTER,
        useClass: ErrorFilter,
    },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
    ],
    exports: [PrismaService, ValidationService, RolesGuard]
})
export class CommonModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .exclude(
                { path: 'api/users/login', method: RequestMethod.POST },
            )
            .forRoutes(
                { path: 'api/users/current', method: RequestMethod.PATCH },
                { path: 'api/users/current', method: RequestMethod.GET },
                { path: 'api/users/:username', method: RequestMethod.DELETE },
              );
}
}