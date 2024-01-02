import { Controller, Get } from '@nestjs/common';
import { Auth } from 'src/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/iam/authentication/enums/auth-type.enum';

@Auth(AuthType.Bearer)
@Controller('users')
export class UsersController {
  @Get()
  findAll() {
    return { users: [{ name: 'Edgar', age: 22 }] };
  }
}
