import { Body, Controller, Inject, Post, Res } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthenticationService } from './authentication.service';
import { Response } from 'express';
import jwtConfig from '../config/jwt.config';
import { ConfigService, ConfigType } from '@nestjs/config';
import { SignInDto } from './dto/sign-in.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { Cookie } from '../decorators/cookie.decorator';

@Auth(AuthType.None)
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly configService: ConfigService,
  ) {}

  @Post('sign-up')
  async signUp(
    @Res({ passthrough: true }) res: Response,
    @Body() signUpDto: SignUpDto,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.signUp(signUpDto);

    this.attachCookiesToResponse(res, refreshToken);
    return { accessToken };
  }

  @Post('sign-in')
  async signIn(
    @Res({ passthrough: true }) res: Response,
    @Body() signInDto: SignInDto,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.signIn(signInDto);

    this.attachCookiesToResponse(res, refreshToken);
    return { accessToken };
  }

  @Post('refresh-token')
  async refreshToken(
    @Cookie('refreshToken') refreshTokenDto: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.refreshTokens({
      refreshToken: refreshTokenDto,
    });

    this.attachCookiesToResponse(res, refreshToken);
    return { accessToken };
  }

  private attachCookiesToResponse(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: true,
      signed: true,
      maxAge: this.jwtConfiguration.refreshTokenTtl,
      //  secure: this.configService.get<string, >('NODE_ENV', 'develompent'),
    });
  }
}
