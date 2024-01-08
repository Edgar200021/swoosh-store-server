import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryParamsDto {
  @IsOptional()
  @IsInt({ message: 'Номер страницы должно быть целым числом' })
  page: number;

  @IsOptional()
  @IsInt({ message: 'Количество продуктов должно быть целым числом' })
  limit: number;

  @IsOptional()
  @IsString()
  fields: string;

  @IsOptional()
  @IsString()
  sort: string;
}
