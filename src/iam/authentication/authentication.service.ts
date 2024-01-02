import { ResetPasswordQueryDto } from './../dto/reset-password-query.dto';
import { SignInDto } from '../dto/sign-in.dto';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/entity/user.entity';
import { Model } from 'mongoose';
import { SignUpDto } from '../dto/sign-up.dto';
import { Token } from 'src/users/entity/token.entity';
import { HashingService } from '../hashing.service';
import { EmailService } from 'src/common/services/mail.service';
import { randomUUID } from 'crypto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Token.name) private readonly tokenModel: Model<Token>,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
    private readonly hashingService: HashingService,
    private readonly emailService: EmailService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const isUserExists = await this.userModel.findOne({
      email: signUpDto.email,
    });

    if (isUserExists) {
      throw new BadRequestException(
        `Пользователь с таким эл. адресом уже существует`,
      );
    }

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
        'Не правильный пароль или эл.адрес пользователя',
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

  async refreshTokens(refreshTokenDto: string) {
    if (!refreshTokenDto) {
      throw new ForbiddenException();
    }

    try {
      const { id } = await this.jwtService.verifyAsync(refreshTokenDto, {
        secret: this.jwtConfiguration.secret,
      });

      const user = await this.userModel.findById(id);

      if (!user) throw new ForbiddenException();

      const { accessToken, refreshToken } = await this.generateTokens(user);

      return {
        accessToken,
        refreshToken,
        user: { id: user._id, email: user.email, role: user.role },
      };
    } catch (error) {
      throw new ForbiddenException();
    }
  }

  async forgotPassword({ email }: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ email });

    if (!user)
      throw new NotFoundException(
        'Пользователь с таким эл․адресом не существует',
      );

    const passwordResetToken = randomUUID();

    user.passwordResetToken =
      await this.hashingService.hash(passwordResetToken);
    user.passwordResetExpires = new Date(new Date().getTime() + 600000);

    await Promise.all([
      await this.emailService.sendPasswordResetEmail(email, passwordResetToken),
      await user.save({ validateBeforeSave: false }),
    ]);
  }

  async resetPassword(
    resetPasswordQuery: ResetPasswordQueryDto,
    resetPasswordDto: ResetPasswordDto,
  ) {
    const user = await this.userModel.findOne({
      email: resetPasswordQuery.email,
      passwordResetExpires: {
        $gt: new Date(),
      },
    });

    if (!user)
      throw new BadRequestException(
        'Пользователь не существует,или время истечении срока восстановления пароля истек',
      );

    const isTokenMatch = await this.hashingService.compare(
      resetPasswordQuery.passwordResetToken,
      user.passwordResetToken,
    );

    if (!isTokenMatch) throw new BadRequestException('Не валидный токен');

    const hashedPassword = await this.hashingService.hash(
      resetPasswordDto.password,
    );

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });
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

    await Promise.all([
      this.tokenModel.findOneAndDelete({ user: user._id }),
      this.tokenModel.create({ refreshToken, user: user._id }),
    ]);

    return { accessToken, refreshToken };
  }
}
