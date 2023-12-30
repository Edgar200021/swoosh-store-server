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
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Token } from 'src/users/entities/token.entity';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Token.name) private readonly tokenModel: Model<Token>,
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

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { id } = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        {
          secret: this.jwtConfiguration.secret,
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
        },
      );

      const user = await this.userModel.findById(id);
      if (!user) throw new UnauthorizedException();

      const token = await this.tokenModel.find({ user: user._id });
      if (!token) throw new UnauthorizedException();

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

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
        this.tokenModel.findOne({ user: user._id }),
      ]);

      if (refreshToken) {
        return { accessToken, refreshToken: refreshToken.refreshToken };
      }

      const newRefreshToken = await this.signToken(
        user._id,
        this.jwtConfiguration.refreshTokenTtl,
      );

      const token = await this.tokenModel.create({
        user: user._id,
        refreshToken: newRefreshToken,
      });

      return { accessToken, refreshToken: token.refreshToken };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException();
    }
  }
}
