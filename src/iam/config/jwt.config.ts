import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  audience: process.env.JWT_TOKEN_AUDIENCE,
  issuer: process.env.JWT_TOKEN_ISSUER,
  secret: process.env.JWT_SECRET,
  accessTokenTtl: Number(process.env.JWT_ACCESS_TOKEN_TTL),
  refreshTokenTtl: Number(process.env.JWT_REFRESH_TOKEN_TTL),
}));
