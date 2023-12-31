import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { REQUEST_USER_KEY } from '../iam.constants';
import { IActiveUser } from '../interfaces/active-user.interface';

export const User = createParamDecorator(
  (field: keyof IActiveUser, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest<Request>()[REQUEST_USER_KEY];

    return field ? user?.[field] : user;
  },
);
