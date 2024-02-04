import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query, UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import {ReviewService} from './review.service';
import {CreateReviewDto} from './dto/create-review.dto';
import {UpdateReviewDto} from './dto/update-review.dto';
import {User} from "../iam/decorators/user.decorator";
import mongoose from "mongoose";
import {QueryParamsDto} from "../common/dto/query-params.dto";
import {Auth} from "../iam/authentication/decorators/auth.decorator";
import {AuthType} from "../iam/authentication/enums/auth-type.enum";
import {Roles} from "../iam/authorization/decorators/roles.decorator";
import {UserRoles} from "../users/enums/user-roles.enum";
import {FilesInterceptor} from "@nestjs/platform-express";

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Auth(AuthType.Bearer)
  @Roles(UserRoles.USER)
  @Post(':productId')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('images', 2, {dest: 'uploads'}))
  create(@UploadedFiles() images: Array<Express.Multer.File>,@Body() createReviewDto: CreateReviewDto, @User('id') userId: string, @Param('productId') productId: string) {
  console.log(productId)

    return this.reviewService.create(new mongoose.Types.ObjectId(userId),new mongoose.Types.ObjectId(productId),createReviewDto, images);
  }

  @Get(':productId')
  async findAll(@Query() queryParamsDto: QueryParamsDto ,@Param('productId') productId: string )
  {
  const {reviews, quantity} = await  this.reviewService.findAll(new mongoose.Types.ObjectId(productId), queryParamsDto);

  return {
    quantity,
    data: reviews
  }
  }

  @Auth(AuthType.Bearer)
  @Roles(UserRoles.USER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto, @User('id') userId: string, @Param(':productId') productId: string) {
    return this.reviewService.update(+id, updateReviewDto);
  }

  @Auth(AuthType.Bearer)
  @Roles(UserRoles.USER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewService.remove(+id);
  }
}
