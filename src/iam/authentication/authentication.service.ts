import { SignInDto } from './../dto/signin.dto';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/entity/user.entity';
import { Model } from 'mongoose';
import { SignUpDto } from '../dto/signup.dto';
import { Token } from 'src/users/entity/token.entity';
import { HashingService } from '../hashing.service';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Token.name) private readonly tokenModel: Model<Token>,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
    private readonly hashingService: HashingService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const hashedPassword = await this.hashingService.hash(signUpDto.password);

    const user = await this.userModel.create({
      ...signUpDto,
      password: hashedPassword,
    });

    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, role: user.role },
    };
  }
  async signIn(signInDto: SignInDto) {
    const user = await this.userModel
      .findOne({ email: signInDto.email })
      .select('+password');

    if (
      !user ||
      !(await this.hashingService.compare(signInDto.password, user.password))
    )
      throw new BadRequestException(
        'Не валидный пароль или эл.адрес пользователя',
      );

    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, role: user.role },
    };
  }
  async logout(userId: User['_id']) {
    await this.tokenModel.findOneAndDelete({ user: userId });
  }
  async refreshTokens(refreshTokenDto: string, userId: User['_id']) {
    if (!refreshTokenDto) {
      await this.tokenModel.findOneAndDelete({ user: userId });
      throw new UnauthorizedException('');
    }

    try {
      const { id } = await this.jwtService.verifyAsync(refreshTokenDto, {
        secret: this.jwtConfiguration.secret,
      });

      const user = await this.userModel.findById(id);

      if (!user) throw new UnauthorizedException('');

      return this.generateTokens(user);
    } catch (error) {
      throw new Error(error);
    }
  }

  private async signToken<T>(
    userId: User['_id'],
    expiresIn: string | number,
    payload?: T,
  ): Promise<string> {
    return await this.jwtService.signAsync(
      { id: userId, ...payload },
      {
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  private async generateTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken(user._id, this.jwtConfiguration.accessTokenTtl, {
        email: user.email,
        role: user.role,
      }),
      this.signToken(user._id, this.jwtConfiguration.refreshTokenTtl),
    ]);

    const tokens = await this.tokenModel.find({ user: user._id });

    if (!tokens.length)
      await this.tokenModel.create({ refreshToken, user: user._id });

    return { accessToken, refreshToken };
  }
}
