import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Cart} from "./entity/cart.entity";
import mongoose, {Model} from "mongoose";
import {User} from "../users/entity/user.entity";
import {Product} from "../products/entities/product.entity";
import {AddCartProductDto} from "./dto/add-cart-product.dto";
import {UpdateCartProductDto} from "./dto/update-cart-product.dto";
import {DeleteCartProductDto} from "./dto/delete-cart-product.dto";
import {QueryParamsDto} from "../common/dto/query-params.dto";

@Injectable()
export class CartService {
	constructor(@InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
	            @InjectModel(Product.name) private readonly productModel: Model<Product> ) {}


	async getAllCardProducts(userId: User['_id'], {page = 1,limit = 8}: QueryParamsDto) {

		const skip = (page * limit) - limit

		const cartTotal = await this.cartModel.aggregate([
			{
			$match: {
			  user: userId
			}
			},
		 {
			$unwind: "$products"
		 },
		 {
			$lookup: {
			  from: "products",
			  localField: "products.product",
			  foreignField: "_id",
			  as: "productInfo"
			}
		 },
		 {
			$unwind: "$productInfo"
		 },
		 {
		   $group: {
		     _id: null,
		     totalQuantity: {
						$sum: "$products.quantity"
		      },
		     totalPrice: {
		       $sum: {
		         $cond: {
		          if: { $ne: ["$productInfo.priceDiscount", null] },
		          then: { $multiply: ["$products.quantity", "$productInfo.priceDiscount"] },
		          else: { $multiply: ["$products.quantity", "$productInfo.price"] }
		        },
		       }
		     },
		   }
		 }]),
		  cartProducts = await this.cartModel.aggregate(
				 [ {
					 $match: { user: userId}
				 },
					 {
						 $unwind: "$products"
					 },

					 {
						 $lookup: {
							 from: "products",
							 localField: "products.product",
							 foreignField: "_id",
							 as: "productInfo"
						 }
					 },

					 {
						 $unwind: "$productInfo"
					 },
					 {
						 $addFields: {
							 "_id": "$products._id",
							 "title": "$productInfo.title",
							 "price": {
								 $cond: {
									 if: { $ne: ["$productInfo.priceDiscount", null] },
									 then: "$productInfo.priceDiscount",
									 else: "$productInfo.price"
								 }
							 },
							 "size": "$products.size",
							 "color": "$products.color",
							 "quantity": "$products.quantity",
							 "image": "$productInfo.image"
						 }

					 },
					 {
						 $project: {
							 color: 1,
							 size: 1,
							 quantity: 1,
							 title:1 ,
							 price: 1,
							 image:1
						 }
					 },

					 {
						 $sort: {
							 _id: 1
						 }
					 },
					 {
						 $skip: skip
					 },
					 {
						 $limit: limit
					 }
				 ])


	return cartProducts.length === 0 ? {total: 0, data: []} : {total: cartTotal[0], data: cartProducts}
	}

	async addCartProduct(userId: User['_id'], {productId,color,size,quantity}: AddCartProductDto) {
		const product = await this.productModel.findById(productId)

		if (!product) throw new NotFoundException(`Продукт с id ${productId} не существует`)

		const cart = await this.cartModel.findOne({user: userId})

		const cartProduct = cart.products.find(p => p.color === color && p.size === size && p.product._id.toString() === productId)


		if (cartProduct) {
			//@ts-expect-error ...
			cart.products = cart.products.map(p => p._id === cartProduct._id ? ({...p, quantity: p.quantity + quantity}) : p)
		} else {
			//@ts-expect-error ...
			cart.products.push({product: new mongoose.Types.ObjectId(productId), color, size, quantity})
		}


		await cart.save()
	}

	async updateCartProduct(userId: User['_id'], {quantity, cartProductId}: UpdateCartProductDto) {
		const cart = await this.cartModel.findOne({user: userId})

		//@ts-expect-error ...
		cart.products =	cart.products.map(p => String(p._id) === cartProductId ? {...p, quantity} : p)

		await cart.save()
	}

	async deleteCartProduct(userId: User['_id'], cartProductId: string) {
		const cart = await this.cartModel.findOne({user: userId})

		cart.products = cart.products.filter(p => String(p._id) !== cartProductId)

		await cart.save()
	}
}
