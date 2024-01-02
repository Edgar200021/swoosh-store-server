import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication/authentication.service';
import { AuthenticationController } from './authentication/authentication.controller';
import jwtConfig from './config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchemaFactory } from 'src/users/entity/user.entity';
import { Token, TokenSchema } from 'src/users/entity/token.entity';
import { HashingService } from './hashing.service';
import { BcryptService } from './bcrypt.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './authentication/guard/authentication.guard';
import { RestrictGuard } from './authorization/guards/restrict.guard';
import { EmailService } from 'src/common/services/mail.service';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
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
  ],
  providers: [
    AuthenticationService,
    { provide: HashingService, useClass: BcryptService },
    { provide: APP_GUARD, useClass: AuthenticationGuard },
    { provide: APP_GUARD, useClass: RestrictGuard },
    EmailService,
  ],
  controllers: [AuthenticationController],
})
export class IamModule {}
