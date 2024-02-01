import mongoose, {Document} from "mongoose";
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {User} from "../../users/entity/user.entity";
import {Product} from "../../products/entities/product.entity";


@Schema()
class CartProduct extends Document {
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
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
	user: User;

	@Prop()
	products: CartProduct[]
}

export const CartSchema = SchemaFactory.createForClass(Cart)

CartSchema.index({user: 1}, {unique: true})