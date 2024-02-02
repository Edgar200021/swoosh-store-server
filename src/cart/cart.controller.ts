import {Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query} from '@nestjs/common';
import {User} from "../iam/decorators/user.decorator";
import {User as UserModel} from '../users/entity/user.entity'
import {CartService} from "./cart.service";
import {Auth} from "../iam/authentication/decorators/auth.decorator";
import {AuthType} from "../iam/authentication/enums/auth-type.enum";
import {AddCartProductDto} from "./dto/add-cart-product.dto";
import mongoose from "mongoose";
import {UpdateCartProductDto} from "./dto/update-cart-product.dto";
import {DeleteCartProductDto} from "./dto/delete-cart-product.dto";
import {QueryParamsDto} from "../common/dto/query-params.dto";


@Auth(AuthType.Bearer)
@Controller('cart')
export class CartController {

	constructor(private readonly cartService: CartService) {}

	@Get()
	async getAllCartProducts(@User('id') userId: UserModel['_id'], @Query() queryParamsDto: QueryParamsDto) {

		const {total, data} =  await this.cartService.getAllCardProducts(new mongoose.Types.ObjectId(userId), queryParamsDto)

		return {quantity: data.length, data: {
				cartProducts: data,
				totalPrice: total.totalPrice ??  0,
				totalQuantity: total.totalQuantity ?? 0
			}}
	}


	@Post()
	@HttpCode(HttpStatus.CREATED)
	async	addCartProduct(@User('id') userId: UserModel['_id'],  @Body() addCartProductDto: AddCartProductDto) {
			await this.cartService.addCartProduct(new mongoose.Types.ObjectId(userId), addCartProductDto)
			return null
		}

	@Put()
	async updateCartProduct(@User('id') userId: UserModel['_id'], @Body() updateCartProductDto: UpdateCartProductDto) {
		await this.cartService.updateCartProduct(userId,updateCartProductDto)
		return null
	}



	@Delete(':id')
	@HttpCode(204)
	async deleteCartProduct(@User('id') userId: UserModel['_id'], @Param('id') cartProductId: string) {
		console.log(cartProductId)
		await this.cartService.deleteCartProduct(userId,cartProductId)
		return null
	}
}
