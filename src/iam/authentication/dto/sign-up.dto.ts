import { IsEmail, IsStrongPassword } from 'class-validator';

export class SignUpDto {
  @IsEmail({}, { message: 'Не валидный эл.адрес' })
  email: string;

  @IsStrongPassword(
    { minLength: 10 },
    { message: 'Придумайте более сложный пароль' },
  )
  password: string;

  @IsStrongPassword({ minLength: 10 }, { message: 'Пароли не совпадают' })
  passwordConfirm: string;
}
