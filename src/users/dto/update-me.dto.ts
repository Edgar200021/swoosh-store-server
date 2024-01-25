import { IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateMeDto {
  @IsOptional()
  @IsEmail({}, { message: 'Не валидный эл.адрес' })
  email: string;

  @IsOptional()
  @IsString({message: 'Имя пользовтеля должна быть формата строка'})
  name: string

}