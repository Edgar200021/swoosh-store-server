import {IsInt, IsString, Max, MaxLength, Min, MinLength} from "class-validator";

export class CreateReviewDto {
	@IsString()
	@MinLength(20, {message: "Минимальная длина текста 20 символов"})
	@MaxLength(400, {message: "Максимальная длина текста 400 символов"})
	text: string

	@IsInt({message: "Рейтинг отзыва должно быть целым числом"})
	@Min(1, {message: "Минимальный рейтинг 1"})
	@Max(5, {message: "Максимальный рейтинг 5"})
	rating: number


}
