import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import {InjectModel} from "@nestjs/mongoose";
import {Review} from "./entities/review.entity";
import {Model} from "mongoose";
import {Product} from "../products/entities/product.entity";
import {User} from "../users/entity/user.entity";
import {QueryParamsDto} from "../common/dto/query-params.dto";
import {CloudinaryService} from "../cloudinary/cloudinary.service";

@Injectable()
export class ReviewService {
  constructor(@InjectModel(Review.name) private readonly reviewModel: Model<Review>,@InjectModel(Product.name) private readonly productModel: Model<Product>, private readonly clodunaryService: CloudinaryService){}
  async create(userId: User['_id'], productId: Product['id'], {text,rating}: CreateReviewDto, images: Array<Express.Multer.File>) {
    if (await this.reviewModel.findOne({user: userId, product: productId})) throw new BadRequestException("У вас уже есть отзыв для этого продукта")
    const imgArr = []

    console.log(productId)

    if (images.length) {
      for (const image of images) {
        const imageUrl = await this.clodunaryService.uploadFile(image)
        imgArr.push(imageUrl)
      }
    }

    return await this.reviewModel.create({
      user: userId,
      product: productId,
      text,
      rating,
      ...(!!imgArr.length && {images: imgArr})
    })
  }

  async findAll(productId: Product['_id'], {page,fields,sort,limit}: QueryParamsDto) {
    const product = await this.productModel.findById(productId)
    if (!product) throw new NotFoundException(`Нет продукта с id ${{productId}}`)

    const skip = page * limit - limit;

    const [reviews, quantity] = await Promise.all([this.reviewModel.find({product: productId}).select(fields).sort(sort).limit(limit).skip(skip), this.reviewModel.countDocuments({product: productId})])


    return {reviews, quantity}
  }

  findOne(id: number) {
    return `This action returns a #${id} review`;
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  remove(id: number) {
    return `This action removes a #${id} review`;
  }
}
