import { UserRole } from 'src/users/enums/user-roles.enum';

export interface ActiveUserData {
  id: string;
  role: UserRole[];
}
