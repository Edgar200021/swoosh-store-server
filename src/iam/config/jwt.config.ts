import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  accessTokenTtl: Number(process.env.JWT_ACCESS_TOKEN_TTL),
  refreshTokenTtl: Number(process.env.JWT_REFRESH_TOKEN_TTL),
  cookieOptions: {
    signed: true,
    sameSite: true,
    httpOnly: true,
    maxAge: Number(process.env.JWT_REFRESH_TOKEN_TTL),
    path: '/',
  },
}));
