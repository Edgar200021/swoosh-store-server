import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  Validate,
} from 'class-validator';
import { IsPasswordMatchingConstraint } from '../authentication/decorators/is-password-matching-constraint.decorator';

export class SignUpDto {
  @IsNotEmpty({ message: 'Укажите эл.адрес' })
  @IsEmail({}, { message: 'Не валидный эл.адрес' })
  email: string;

  @IsStrongPassword(
    { minLength: 8 },
    { message: 'Придумайте более сложный пароль' },
  )
  @IsNotEmpty({ message: 'Укажите пароль' })
  password: string;

  @IsNotEmpty({ message: 'Подтвердите пароль' })
  @Validate(IsPasswordMatchingConstraint)
  passwordConfirm: string;
}
