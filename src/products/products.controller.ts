import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Query, HttpStatus, HttpCode
} from "@nestjs/common";
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';

import { unlinkSync } from 'fs';
import { ProductQueryParamsDto } from './dto/product-query-params.dto';
import { QueryService } from "../common/services/query.service";
import mongoose from "mongoose";

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  async findAll(@Query() productQueryParamsDto: ProductQueryParamsDto) {
    const obj = QueryService.transformFilterObj<ProductQueryParamsDto>(
      productQueryParamsDto,
    );

    const { quantity, products } = await this.productsService.findAll(obj);

    return { quantity, data: products };
  }

  @Get('filters')
  getFilters() {
    return this.productsService.getFilters()
  }


  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image', { dest: 'uploads' }))
  async uploadImage(
      @UploadedFile(
          new ParseFilePipe({
            fileIsRequired: true,
            validators: [
              new MaxFileSizeValidator({ maxSize: 1024 * 1024 }),
              new FileTypeValidator({ fileType: 'image' }),
            ],
          }),
      )
          file: Express.Multer.File,
  ) {
    const image = await this.productsService.uploadImage(file);
    unlinkSync(file.path);

    return { image };
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(new mongoose.Types.ObjectId(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(new mongoose.Types.ObjectId(id), updateProductDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.productsService.remove(new mongoose.Types.ObjectId(id));
  }


}
