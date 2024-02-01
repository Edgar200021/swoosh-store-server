import {IsInt, IsNotEmpty, IsString} from "class-validator";

export class UpdateCartProductDto {

	@IsString()
	@IsNotEmpty()
	cartProductId: string


	@IsInt({})
	@IsNotEmpty()
	quantity: number
}