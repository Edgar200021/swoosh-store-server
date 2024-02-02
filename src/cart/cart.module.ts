import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import {MongooseModule} from "@nestjs/mongoose";
import {Cart,  CartSchemaFactory} from "./entity/cart.entity";
import {Product, ProductSchemaFactory} from "../products/entities/product.entity";

@Module({
  imports: [MongooseModule.forFeatureAsync([
    {
      name: Cart.name,
      useFactory: CartSchemaFactory
    },
    {
      name: Product.name,
      useFactory: ProductSchemaFactory
    }
  ])],
  controllers: [CartController],
  providers: [CartService]
})
export class CartModule {}
