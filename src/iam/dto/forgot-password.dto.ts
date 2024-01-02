import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty({ message: 'Заполните эл.адрес' })
  @IsEmail()
  email: string;
}
