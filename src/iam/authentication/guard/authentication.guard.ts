import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model } from 'mongoose';
import jwtConfig from 'src/iam/config/jwt.config';
import { User } from 'src/users/entity/user.entity';
import { AUTH_METADATA_KEY } from '../decorators/auth.decorator';
import { AuthType } from '../enums/auth-type.enum';
import { REQUEST_USER_KEY } from 'src/iam/iam.constants';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const authType = this.reflector.getAllAndOverride(AUTH_METADATA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (authType === undefined || authType === AuthType.None) return true;

    const token = this.extractTokenFromHeader(req);

    if (!token) throw new UnauthorizedException();

    try {
      const { id } = await this.jwtService.verifyAsync(token, {
        secret: this.jwtConfiguration.secret,
      });

      const user = await this.userModel.findById(id);

      if (!user) throw new UnauthorizedException();

      req[REQUEST_USER_KEY] = user;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }

    return true;
  }

  private extractTokenFromHeader(req: Request): string | undefined {
    const token = req.headers.authorization?.split(' ')[1];

    return token;
  }
}
