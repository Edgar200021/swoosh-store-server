import {Controller, Delete, Get, HttpCode, HttpStatus, Post, Put} from '@nestjs/common';
import {User} from "../iam/decorators/user.decorator";
import {User as UserModel} from '../users/entity/user.entity'
import {CartService} from "./cart.service";
import {Auth} from "../iam/authentication/decorators/auth.decorator";
import {AuthType} from "../iam/authentication/enums/auth-type.enum";
import {AddCartProductDto} from "./dto/add-cart-product.dto";
import mongoose from "mongoose";
import {UpdateCartProductDto} from "./dto/update-cart-product.dto";
import {DeleteCartProductDto} from "./dto/delete-cart-product.dto";


@Auth(AuthType.Bearer)
@Controller('cart')
export class CartController {

	constructor(private readonly cartService: CartService) {}

	@Get()
	async getAllCartProducts(@User('id') userId: UserModel['_id']) {

		const cartProducts =  await this.cartService.getAllCardProducts(new mongoose.Types.ObjectId(userId))

		return {quantity: cartProducts.length, data: cartProducts}
	}


	@Post()
@HttpCode(HttpStatus.CREATED)
async	addCartProduct(@User('id') userId: UserModel['_id'], addCartProductDto: AddCartProductDto) {
		await this.cartService.addCartProduct(new mongoose.Types.ObjectId(userId), addCartProductDto)
	}

	@Put()
	async updateCartProduct(@User('id') userId: UserModel['_id'], updateCartProductDto: UpdateCartProductDto) {
		await this.cartService.updateCartProduct(userId,updateCartProductDto)
		return null
	}



	@Delete()
	@HttpCode(204)
	async deleteCartProduct(@User('id') userId: UserModel['_id'], deleteCartProductDto: DeleteCartProductDto) {
		await this.cartService.deleteCartProduct(userId,deleteCartProductDto)
		return null
	}
}
