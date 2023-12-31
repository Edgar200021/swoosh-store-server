import { SetMetadata } from '@nestjs/common';
import { AuthType } from '../enums/auth-type.enum';

export const AUTH_METADATA_KEY = 'auth';

export const Auth = (authType: AuthType) =>
  SetMetadata(AUTH_METADATA_KEY, authType);
