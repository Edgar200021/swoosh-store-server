import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

export class ResetPasswordQueryDto {
  @IsNotEmpty({ message: 'Укажите эл.адрес ' })
  @IsEmail({}, { message: 'Не валидный эл.адрес' })
  email: string;

  @IsNotEmpty({ message: 'Укажите токен для смены пароля ' })
  @IsUUID()
  passwordResetToken: string;
}
