import { IsPasswordMatchingConstraint } from './../authentication/decorators/is-password-matching-constraint.decorator';
import { IsNotEmpty, IsStrongPassword, Validate } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Укажите пароль' })
  @IsStrongPassword({ minLength: 8 })
  password: string;

  @Validate(IsPasswordMatchingConstraint)
  passwordConfirm: string;
}
