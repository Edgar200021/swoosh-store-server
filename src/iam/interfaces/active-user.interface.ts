import { User } from 'src/users/entity/user.entity';
import { UserRoles } from 'src/users/enums/user-roles.enum';

export interface IActiveUser {
  id: User['_id'];
  email: string;
  role: UserRoles[];
}
