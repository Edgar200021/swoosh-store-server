import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { For, Materials } from '../enums/product.enum';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: [true, 'У продукта должно быть название'], unique: true })
  title: string;

  @Prop({ required: [true, 'У продукта должно быть картинка'] })
  image: string;

  @Prop({ required: [true, 'У продукта должно быть описание'], unique: true })
  description: string;

  @Prop({
    type: String,
    enum: {
      values: Object.values(For),
      message: `{VALUE} отличается от ${Object.values(For).join(',')}`,
    },
    required: [true, 'Укажите для кого этот продукт'],
  })
  for: For;

  @Prop({
    type: String,
    enum: {
      values: Object.values(Materials),
      message: `{VALUE} отличается от ${Object.values(Materials).join(',')}`,
    },
  })
  material: Materials;

  @Prop({
    type: [String],
    required: [true, 'У продукта должны быть цвета'],
    validate: {
      validator: (val: string[]) => {
        return (
          !!val.length &&
          val.every((value) =>
            /^#(([0-9a-fA-F]{2}){3}|([0-9a-fA-F]){3})$/.test(value),
          )
        );
      },
      message: 'Цвета должны быть в формате hex',
    },
  })
  colors: string[];

  @Prop({
    type: [Number],
    required: [true, 'Укажите размеры товара'],
    validate: {
      validator: (val: number[]) => {
        return (
          !!val.length &&
          val.every(
            (value) => Number.isInteger(value) && value >= 10 && value <= 50,
          )
        );
      },
      message: 'Размер должен быть целым числом в диапазоне от 10 до 51 ',
    },
  })
  size: number[];

  @Prop({
    required: [true, 'Укажите цену'],
    validate: {
      validator: Number.isInteger,
      message: 'Цена должно быть целым числом',
    },
  })
  price: number;

  @Prop({})
  priceDiscount: number;

  @Prop({
    min: [1, 'Минимальная значение скидки 1%'],
    max: [99, 'Максимальная значение скидки 99%'],
    validate: {
      validator: Number.isInteger,
      message: 'Скидка должно быть целым числом',
    },
  })
  discount: number;

  @Prop({
    min: [1, 'Минимальный рейтинг продукта 1'],
    max: [5, 'Максимальный рейтинг продукта 5'],

    default: 4.5,
  })
  rating: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

export const ProductSchemaFactory = () => {
  ProductSchema.pre<Product>('save', function (next) {
    if (this.discount) {
      this.priceDiscount = this.price * (1 - this.discount / 100);
    }

    next();
  });

  return ProductSchema;
};
