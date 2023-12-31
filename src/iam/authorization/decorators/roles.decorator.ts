import { SetMetadata } from '@nestjs/common';
import { UserRoles } from 'src/users/enums/user-roles.enum';

export const ROLES_METADATA_KEY = 'roles';

export const Roles = (...roles: UserRoles[]) =>
  SetMetadata(ROLES_METADATA_KEY, roles);
