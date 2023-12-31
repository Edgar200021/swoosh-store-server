import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInDto {
  @IsNotEmpty({ message: 'Укажите эл.адрес' })
  @IsEmail({}, { message: 'Не валидный эл.адрес' })
  email: string;

  @IsNotEmpty({ message: 'Укажите пароль' })
  password: string;
}
