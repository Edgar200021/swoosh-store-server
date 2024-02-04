import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';
import {For, Materials, Sale} from '../enums/product.enum';

export class ProductQueryParamsDto extends PartialType(QueryParamsDto) {
  @IsOptional()
  @IsInt({ message: 'Цена должно быть целым числом' })
  'price>=': number;

  @IsOptional()
  @IsInt({ message: 'Цена должно быть целым числом' })
  'price<=': number;

  @IsOptional()
  @IsInt({ message: 'Цена должно быть целым числом' })
  'price<': number;

  @IsOptional()
  @IsInt({ message: 'Цена должно быть целым числом' })
  'price>': number;

  @IsOptional()
  @IsInt({ message: 'Цена должно быть целым числом' })
  price: number;

  @IsOptional()
  @IsNumber({}, { message: 'Рейтинг должно быть числом' })
  @Min(1, { message: 'Минимальный рейтинг 1' })
  @Max(5, { message: 'Максимальный рейтинг 5' })
  'rating>=': number;

  @IsOptional()
  @IsNumber({}, { message: 'Рейтинг должно быть числом' })
  @Min(1, { message: 'Минимальный рейтинг 1' })
  @Max(5, { message: 'Максимальный рейтинг 5' })
  'rating<=': number;

  @IsOptional()
  @IsNumber({}, { message: 'Рейтинг должно быть числом' })
  @Min(1, { message: 'Минимальный рейтинг 1' })
  @Max(5, { message: 'Максимальный рейтинг 5' })
  'rating<': number;

  @IsOptional()
  @IsNumber({}, { message: 'Рейтинг должно быть числом' })
  @Min(1, { message: 'Минимальный рейтинг 1' })
  @Max(5, { message: 'Максимальный рейтинг 5' })
  'rating>': number;

  @IsOptional()
  @IsNumber({}, { message: 'Рейтинг должно быть числом' })
  @Min(1, { message: 'Минимальный рейтинг 1' })
  @Max(5, { message: 'Максимальный рейтинг 5' })
  rating: number;

  @IsOptional()
  @Transform(({ value }) => ({
    $regex: typeof value === 'object' ? Object.values(value).join() : value,
  }))
  @IsObject()
  title: { $regex: string };

  @IsOptional()
  @IsString({ message: 'Цвет должно быть формата строка' })
  colors: string;

  @IsOptional()
  @IsInt({ message: 'Размер продукта должно быть числом' })
  size: number;

  @IsOptional()
  @IsEnum(Materials, {
    message: `Значение отличается от ${Object.values(Materials).join(',')}`,
  })
  material: Materials;

  @IsOptional()
  @IsEnum(For, {
    message: `Значение отличается от ${Object.values(For).join(',')}`,
  })
  for: For;

  @IsOptional()
  @IsEnum(Sale, {
    message: `Значение отличается от ${Object.values(Sale).join(',')}`,
  })
  sale: Sale;


}
