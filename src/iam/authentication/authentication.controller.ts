import { Body, Controller, Get, Inject, Post, Res } from '@nestjs/common';
import { SignUpDto } from '../dto/signup.dto';
import { AuthenticationService } from './authentication.service';
import { Response } from 'express';
import { COOKIE_TOKEN_KEY } from '../iam.constants';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { SignInDto } from '../dto/signin.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { User } from '../decorators/user.decorator';
import { User as UserModel } from 'src/users/entity/user.entity';
import { Cookie } from '../decorators/cookie.decorator';

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

    return { user, accessToken };
  }

  @Post('sign-in')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.signIn(signInDto);

    this.attachCookieToResponse(res, COOKIE_TOKEN_KEY, refreshToken);

    return { user, accessToken };
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

  @Auth(AuthType.Bearer)
  @Get('refresh-tokens')
  async refresh(
    @Cookie(COOKIE_TOKEN_KEY) refreshToken: string,
    @User('id') userId: UserModel['_id'],
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log(refreshToken);
    console.log('true');
    const { accessToken, refreshToken: token } =
      await this.authService.refreshTokens(refreshToken, userId);

    this.attachCookieToResponse(res, COOKIE_TOKEN_KEY, token);

    return { accessToken };
  }

  private attachCookieToResponse(res: Response, key: string, value: string) {
    res.cookie(key, value, this.jwtConfiguration.cookieOptions);
  }
}
