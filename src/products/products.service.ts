import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './entities/product.entity';
import { Model } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ProductQueryParamsDto } from './dto/product-query-params.dto';
import { QueryService } from "../common/services/query.service";
import { NotFoundError } from "rxjs";
import { User } from "../users/entity/user.entity";

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly clodunaryService: CloudinaryService,
  ) {

  }

  async create(createProductDto: CreateProductDto) {
    return this.productModel.create(createProductDto);
  }

  async findAll(productQueryParamsDto: ProductQueryParamsDto) {
    const skip =
      productQueryParamsDto.page * productQueryParamsDto.limit -
      productQueryParamsDto.limit;
    const filters = QueryService.excludeFields<ProductQueryParamsDto>(
      productQueryParamsDto,
    );


    const products = await this.productModel
      .find(filters)
      .select(productQueryParamsDto.fields)
      .sort(productQueryParamsDto.sort)
      .limit(productQueryParamsDto.limit)
      .skip(skip);

    const quantity = await this.productModel.countDocuments(filters);

    return { quantity, products };
  }

  async findOne(id: User['id']) {
    const product = await this.productModel.findById(id)

    if (!product) {
      throw new NotFoundException("Продукт с таким id не нейден")
    }

    return product
  }

  async update(id: User["id"], updateProductDto: UpdateProductDto) {

    const updatedProduct = await this.productModel.findByIdAndUpdate(id, updateProductDto, {new:true, runValidators: true})

    if (!updatedProduct)  throw new NotFoundException("Продукт с таким id не нейден")

    return updatedProduct
  }

  async remove(id: User['id']) {

    const user = await this.productModel.findOneAndDelete(id)

    if (!user) throw new NotFoundException("Продукт с таким id не нейден")

   return null
  }

  async getFilters() {
    const filters = await this.productModel.aggregate([
      {
        $unwind: '$colors',
      },
      {
        $unwind: '$size'
      },
      {
        $group: {
          _id: null,
          minPrice: {
             $min: '$price'
          },
          maxPrice: {
            $max: '$price'
          },
          colors: {
            $addToSet: '$colors'
          },
          size: {
            $addToSet: '$size'
          },
          material: {
            $addToSet: '$material'
          }
        }
      }
    ])

    return filters[0]
  }

  async uploadImage(file: Express.Multer.File) {
    return this.clodunaryService.uploadFile(file);
  }


}
