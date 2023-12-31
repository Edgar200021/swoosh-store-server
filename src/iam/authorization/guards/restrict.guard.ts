import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_METADATA_KEY } from '../decorators/roles.decorator';
import { IActiveUser } from 'src/iam/interfaces/active-user.interface';
import { REQUEST_USER_KEY } from 'src/iam/iam.constants';
import { UserRoles } from 'src/users/enums/user-roles.enum';

@Injectable()
export class RestrictGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const activeUser: IActiveUser = context
      .switchToHttp()
      .getRequest<Request>()[REQUEST_USER_KEY];
    const roles = this.reflector.getAllAndOverride<UserRoles[]>(
      ROLES_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    ) || [UserRoles.USER];

    if (!activeUser) return true;

    return roles.some((value) => activeUser.role.includes(value));
  }
}
