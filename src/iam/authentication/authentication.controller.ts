import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { SignUpDto } from '../dto/sign-up.dto';
import { AuthenticationService } from './authentication.service';
import { Response } from 'express';
import { COOKIE_TOKEN_KEY } from '../iam.constants';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { SignInDto } from '../dto/sign-in.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { User } from '../decorators/user.decorator';
import { User as UserModel } from 'src/users/entity/user.entity';
import { Cookie } from '../decorators/cookie.decorator';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ResetPasswordQueryDto } from '../dto/reset-password-query.dto';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  @Post('sign-up')
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.signUp(signUpDto);

    this.attachCookieToResponse(res, COOKIE_TOKEN_KEY, refreshToken);

    return {
      user,
      accessToken,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.signIn(signInDto);

    this.attachCookieToResponse(res, COOKIE_TOKEN_KEY, refreshToken);

    return {
      user,
      accessToken,
    };
  }

  @Auth(AuthType.Bearer)
  @Get('logout')
  async logout(
    @User('id') userId: UserModel['_id'],
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(userId);
    res.clearCookie(COOKIE_TOKEN_KEY, this.jwtConfiguration.cookieOptions);

    return null;
  }

  @Get('refresh-tokens')
  async refresh(
    @Cookie(COOKIE_TOKEN_KEY) refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const {
      accessToken,
      refreshToken: token,
      user,
    } = await this.authService.refreshTokens(refreshToken);

    this.attachCookieToResponse(res, COOKIE_TOKEN_KEY, token);

    return {
      user,
      accessToken,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    console.log(forgotPasswordDto);
    await this.authService.forgotPassword(forgotPasswordDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(
    @Query() resetPasswordQueryDto: ResetPasswordQueryDto,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    await this.authService.resetPassword(
      resetPasswordQueryDto,
      resetPasswordDto,
    );
  }

  private attachCookieToResponse(res: Response, key: string, value: string) {
    res.cookie(key, value, this.jwtConfiguration.cookieOptions);
  }
}
