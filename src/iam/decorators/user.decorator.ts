import { createParamDecorator } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Request } from 'express';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { REQUEST_USER_KEY } from '../iam.constants';

export const User = createParamDecorator(
  (field: keyof ActiveUserData | undefined, ctx: ExecutionContextHost) => {
    const req = ctx.switchToHttp().getResponse<Request>();

    const user: ActiveUserData = req[REQUEST_USER_KEY];

    return field ? user?.[field] : user;
  },
);
