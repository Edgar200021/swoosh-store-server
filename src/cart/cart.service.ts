import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Cart} from "./entity/cart.entity";
import mongoose, {Model} from "mongoose";
import {User} from "../users/entity/user.entity";
import {Product} from "../products/entities/product.entity";
import {AddCartProductDto} from "./dto/add-cart-product.dto";
import {UpdateCartProductDto} from "./dto/update-cart-product.dto";
import {DeleteCartProductDto} from "./dto/delete-cart-product.dto";

@Injectable()
export class CartService {
	constructor(@InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
	            @InjectModel(Product.name) private readonly productModel: Model<Product> ) {}


	async getAllCardProducts(userId: User['_id']) {

		const cart = await this.cartModel.findOne({user: userId})


		return cart.products
	}

	async addCartProduct(userId: User['_id'], {productId,color,size,quantity}: AddCartProductDto) {
		const product = await this.productModel.findById(productId)

		if (!product) throw new NotFoundException(`Продукт с id ${productId} не существует`)

		const cart = await this.cartModel.findOne({user: userId}),
				cartProduct = cart.products.find(p => p.color === color && p.size === size && p._id.toString() === productId)

		if (cartProduct) {
				cartProduct.quantity +=  quantity
		} else {
			//@ts-expect-error ...
			cart.products.push({product: new mongoose.Types.ObjectId(productId), color, size, quantity})
		}

		await cart.save()
	}

	async updateCartProduct(userId: User['_id'], {quantity, cartProductId}: UpdateCartProductDto) {
		const cart = await this.cartModel.findOne({user: userId})

		//@ts-expect-error ...
		cart.products =	cart.products.map(p => p._id === cartProductId ? {...p, quantity} : p)

		await cart.save()
	}

	async deleteCartProduct(userId: User['_id'], deleteCartProductDto: DeleteCartProductDto) {
		const cart = await this.cartModel.findOne({user: userId})

		cart.products = cart.products.filter(p => p._id !== deleteCartProductDto.cartProductId)

		await cart.save()
	}
}
