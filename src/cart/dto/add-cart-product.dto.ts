import {IsInt, IsNotEmpty, IsString} from "class-validator";


export class AddCartProductDto {
	@IsNotEmpty({message: 'Укажите id продукта'})
	@IsString()
	productId: string

	@IsNotEmpty({message: 'Укажите цвет продукта'})
	@IsString()
	color: string

	@IsNotEmpty({message: 'Укажите размер продукта'})
	@IsString()
	size: string

	@IsNotEmpty({message: 'Укажите количество добавляемого товара'})
	@IsInt()
	quantity: number
}