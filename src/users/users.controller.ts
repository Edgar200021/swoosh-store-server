import {
  Body,
  Controller, FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Put,
  Query,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { UserQueryParams } from "./dto/user-query-params";
import { UserService } from "./user.service";
import { UserRoles } from "./enums/user-roles.enum";
import { Roles } from "../iam/authorization/decorators/roles.decorator";
import { AuthType } from "../iam/authentication/enums/auth-type.enum";
import { Auth } from "../iam/authentication/decorators/auth.decorator";
import { User as UserModel } from "./entity/user.entity";
import { UpdateMeDto } from "./dto/update-me.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { unlinkSync } from "fs";
import {User} from "../iam/decorators/user.decorator";

@Auth(AuthType.Bearer)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService){}

  @Roles(UserRoles.ADMIN)
  @Get()
  findAll(@Query() userQueryParams: UserQueryParams) {

   return this.userService.findAll(userQueryParams)
  }

  @Roles(UserRoles.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: UserModel['id']) {
   return this.userService.findOne(id)
  }

  @Roles(UserRoles.USER)
  @Put()
  @UseInterceptors(FileInterceptor('avatar', { dest: 'uploads' }))
  async updateMe(@Body() updateMeDto: UpdateMeDto, @UploadedFile(
    new ParseFilePipe({
      fileIsRequired: false,
      validators: [
        new MaxFileSizeValidator({ maxSize: 1024 * 1024 }),
        new FileTypeValidator({ fileType: 'image' }),
      ],
    }),
  )
    file: Express.Multer.File,
   @User('id') userId: UserModel['_id']) {

    const user = await this.userService.updateMe(userId, updateMeDto, file)
    unlinkSync(file.path);

    console.log(user)
    return user
  }
}
