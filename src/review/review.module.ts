import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Review, ReviewSchemaFactory} from "./entities/review.entity";
import {Product, ProductSchemaFactory} from "../products/entities/product.entity";
import {CloudinaryModule} from "../cloudinary/cloudinary.module";

@Module({

  imports: [MongooseModule.forFeatureAsync([
    {name: Review.name,
    useFactory: ReviewSchemaFactory},
    {
      name: Product.name,
      useFactory: ProductSchemaFactory
    }
  ]), CloudinaryModule],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
