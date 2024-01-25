import { PartialType } from "@nestjs/mapped-types";
import { QueryParamsDto } from "../../common/dto/query-params.dto";
import { IsObject, IsOptional } from "class-validator";
import { Transform } from "class-transformer";


export class UserQueryParams extends PartialType(QueryParamsDto){
  @IsOptional()
  @Transform(({ value }) => ({
    $regex: typeof value === 'object' ? Object.values(value).join() : value,
  }))
  @IsObject()
  name: { $regex: string };

  @IsOptional()
  @Transform(({ value }) => ({
    $regex: typeof value === 'object' ? Object.values(value).join() : value,
  }))
  @IsObject()
  email: { $regex: string };


}
