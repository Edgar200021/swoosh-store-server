import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication/authentication.controller';
import { HashingService } from './hashing.service';
import { BcryptService } from './bcrypt.service';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserSchema,
  UserSchemaFactory,
} from 'src/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationService } from './authentication/authentication.service';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './authentication/guards/access-token.guard';
import { AuthenticationGuard } from './authentication/guards/authentication.guard';
import { Token, TokenSchema } from 'src/users/entities/token.entity';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: UserSchemaFactory,
      },
      {
        name: Token.name,
        useFactory: () => TokenSchema,
      },
    ]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],
  controllers: [AuthenticationController],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    AuthenticationService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    AccessTokenGuard,
  ],
})
export class IamModule {}
