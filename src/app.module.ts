import { Module } from '@nestjs/common';
import { IamModule } from './iam/iam.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import * as Joi from 'joi';
@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production')
          .default('development'),
        JWT_SECRET: Joi.string(),
        JWT_TOKEN_AUDIENCE: Joi.string(),
        JWT_TOKEN_ISSUER: Joi.string(),
        JWT_ACCESS_TOKEN_TTL: Joi.number(),
        JWT_REFRESH_TOKEN_TTL: Joi.number(),
        DB: Joi.string(),
      }),
    }),
    MongooseModule.forRoot(process.env.DB),
    IamModule,
    UsersModule,
  ],
})
export class AppModule {}
