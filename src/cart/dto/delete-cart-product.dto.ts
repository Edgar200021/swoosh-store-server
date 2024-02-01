import {IsNotEmpty, IsString} from "class-validator";

export class DeleteCartProductDto {
	@IsString()
	@IsNotEmpty()
	cartProductId: string
}