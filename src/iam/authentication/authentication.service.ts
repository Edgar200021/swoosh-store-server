import { User } from './../../users/entities/user.entity';
import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { HashingService } from '../hashing.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const user = await this.userModel.create({
      ...signUpDto,
    });

    return await this.generateTokens(user);
  }
  async signIn(signInDto: SignInDto) {
    const user = await this.userModel.findOne({ email: signInDto.email });

    if (
      !user ||
      !(await this.hashingService.compare(signInDto.password, user.password))
    )
      throw new NotFoundException('Invalid email or password');

    return await this.generateTokens(user);
  }

  async refreshTokens() {}

  private async signToken<T>(
    id: string | number | Schema.Types.ObjectId,
    expiresIn: string | number,
    payload?: T,
  ) {
    return await this.jwtService.signAsync(
      { id, ...payload },
      {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        expiresIn,
      },
    );
  }

  private async generateTokens(user: User) {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.signToken(user._id, this.jwtConfiguration.accessTokenTtl, {
          role: user.role,
        }),
        this.signToken(user._id, this.jwtConfiguration.refreshTokenTtl, {
          role: user.role,
        }),
      ]);

      return { accessToken, refreshToken };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
