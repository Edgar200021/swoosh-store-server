import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import mongoose, {Document} from "mongoose";
import {Product} from "../../products/entities/product.entity";
import {User} from "../../users/entity/user.entity";

@Schema({timestamps: true})
export class Review extends Document {
	@Prop({ required: [true, 'У отзыва должно быть текст'],
		minlength: [20, 'Минимальная длина текста 20 символов'],
		maxLength: [400, 'Максимальная длина текста 20 символов']})
	text: string

	@Prop({required: [true, 'У отвыза должно быть рейтинг'], min: [1, 'Минимальный рейтинг 1'],max: [5, 'Максимальный рейтинг 5'], validate : {
			validator : Number.isInteger,
			message   : 'Рейтинг должно быть целым числом'
		}})
	rating: number

	@Prop()
	images: string[]

	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
	product: Product

	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
	user: User
}

export const ReviewSchema = SchemaFactory.createForClass(Review)

ReviewSchema.index({product: 1, user:1}, {unique: true})

export const ReviewSchemaFactory = () => {

	ReviewSchema.pre(/^find/, function(next) {
		//@ts-expect-error ...
		this.populate({
			path: "user",
			model: "User",
			select: "name _id"
		})

		next()
	})


	return ReviewSchema
}
