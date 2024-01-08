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
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';

import { unlinkSync } from 'fs';
import { ProductQueryParamsDto } from './dto/product-query-params.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    //return this.productsService.create(createProductDto);
    return this.productsService.createAll();
  }

  @Get()
  async findAll(@Query() productQueryParamsDto: ProductQueryParamsDto) {
    const obj = this.transformFilterObj<ProductQueryParamsDto>(
      productQueryParamsDto,
    );

    const { quantity, products } = await this.productsService.findAll(obj);

    return { quantity, data: products };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
  @Delete('')
  removeAll(@Param('id') id: string) {
    return this.productsService.removeAll();
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

  private transformFilterObj<T>(queryObj: { [key in keyof T]: T[key] }) {
    const map = new Map(Object.entries(queryObj));
    const symbols = {
      '<=': '$lte',
      '>=': '$gte',
      '>': '$gt',
      '<': '$lt',
    };

    map.forEach((val, key) => {
      const regex = key.match(new RegExp(Object.keys(symbols).join('|')));

      if (!regex) {
        return;
      }

      const prefix = key.slice(0, regex.index);

      if (map.has(prefix)) {
        map.get(prefix)[symbols[regex[0]]] = map.get(key);
        map.delete(key);
        return;
      }

      map.set(prefix, {});
      map.set(prefix, { [symbols[regex[0]]]: map.get(key) });
      map.delete(key);
    });

    return Object.fromEntries(map) as T;
  }
}
