import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsHexColor,
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  IsOptional,
  Max,
} from 'class-validator';
import { For, Materials } from '../enums/product.enum';

export class CreateProductDto {
  @IsNotEmpty({ message: 'У продукта должно быть название' })
  @IsString({ message: 'Название продукта должно быть формата строка' })
  title: string;

  @IsNotEmpty({ message: 'У продукта должно быть картинка' })
  @IsString({ message: 'Картинка продукта должно быть формата строка' })
  image: string;

  @IsNotEmpty({ message: 'У продукта должно быть название' })
  @IsString({ message: 'Описание продукта должно быть формата строка' })
  description: string;

  @IsNotEmpty({ message: 'Укажите для кого этот продукт' })
  @IsEnum(For, {
    message: `Значение отличается от ${Object.values(For).join(',')}`,
  })
  for: For;

  @IsNotEmpty({ message: 'Укажите материал продукта' })
  @IsEnum(Materials, {
    message: `Значение отличается от ${Object.values(Materials).join(',')}`,
  })
  material: Materials;

  @IsArray({ message: 'Цвет продукта должно быть формата массив строк' })
  @ArrayMinSize(1, { message: 'У продукта должно быть хотя бы 1 цвет' })
  @IsHexColor({ each: true, message: 'Цвет должно быть формата hex' })
  colors: string[];

  @IsArray({ message: 'Размер продукта должно быть формата массив чисел' })
  @ArrayMinSize(1, { message: 'У продукта должно быть хотя бы 1 размер' })
  @IsInt({ each: true, message: 'Размер должен быть целым числом' })
  @Min(10, { each: true, message: 'Минимальный размер 36' })
  @Max(50, { each: true, message: 'Максимальный размер 50' })
  size: number[];

  @IsNotEmpty({ message: 'Укажите цену товара' })
  @Min(500, { message: 'Минимальная цена 500 рублей' })
  @IsInt()
  price: number;

  @IsOptional()
  @IsInt({ message: 'Скидка должен быть целым числом' })
  @Min(1, { message: 'Минимальная скидка 1 %' })
  @Max(99, { message: 'Максимальная скидка 99 %' })
  discount: number;
}
