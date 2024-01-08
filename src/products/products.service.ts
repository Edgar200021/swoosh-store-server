import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './entities/product.entity';
import { Model } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ProductQueryParamsDto } from './dto/product-query-params.dto';
import { MongooseQueryService } from 'src/common/services/mongoose-query.service';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';

@Injectable()
export class ProductsService {
  private readonly products: Buffer;
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly clodunaryService: CloudinaryService,
  ) {
    this.products = JSON.parse(
      readFileSync(join('src/devData/products.json'), {
        encoding: 'utf-8',
      }),
    );
  }

  async create(createProductDto: CreateProductDto) {
    return this.productModel.create(createProductDto);
  }

  async findAll(productQueryParamsDto: ProductQueryParamsDto) {
    const skip =
      productQueryParamsDto.page * productQueryParamsDto.limit -
      productQueryParamsDto.limit;
    const filters = this.excludeFields<ProductQueryParamsDto>(
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

  async findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: number) {
    return `This action removes a #${id} product`;
  }

  async uploadImage(file: Express.Multer.File) {
    return this.clodunaryService.uploadFile(file);
  }

  async removeAll() {
    await this.productModel.deleteMany();
  }

  async createAll() {
    await this.productModel.create(this.products);
  }

  private excludeFields<T extends Partial<QueryParamsDto>>(obj: T) {
    const fields = new Set(['sort', 'fields', 'page', 'limit']);

    return Object.fromEntries(
      Object.entries(obj).filter(([key]) => !fields.has(key)),
    );
  }
}
