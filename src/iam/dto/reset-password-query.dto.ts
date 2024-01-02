import { IsEmail, IsUUID } from 'class-validator';

export class ResetPasswordQueryDto {
  @IsEmail()
  email: string;

  @IsUUID()
  passwordResetToken: string;
}
