import mongoose, {Document} from "mongoose";
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {User} from "../../users/entity/user.entity";
import {Product} from "../../products/entities/product.entity";


@Schema()
export class CartProduct extends Document {
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
	product: Product

	@Prop()
	color: string

	@Prop()
	size: string

	@Prop()
	quantity: number
}


@Schema({toJSON: {virtuals: true}, toObject: {virtuals: true}})
export class Cart extends Document {
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true })
	user: User;

	@Prop({ type: [CartProduct] })
	products: CartProduct[]
}

export const CartSchema = SchemaFactory.createForClass(Cart)

export const CartSchemaFactory = () => {

	CartSchema.pre(/^find/,  function(next) {
		//@ts-expect-error ...
		this.populate({
			path: "products",
			populate: {
				path: "product",
				model: "Product",
				select: "image title price priceDiscount ",
			}
		}).select('-user')

		next()
	})

		return CartSchema;
}

