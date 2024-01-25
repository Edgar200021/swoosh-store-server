import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./entity/user.entity";
import { Model } from "mongoose";
import { UserQueryParams } from "./dto/user-query-params";
import { QueryService } from "../common/services/query.service";
import { RestrictGuard } from "../iam/authorization/guards/restrict.guard";
import { UpdateMeDto } from "./dto/update-me.dto";
import { CloudinaryService } from "../cloudinary/cloudinary.service";


@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>, private readonly cloudinaryService: CloudinaryService) {
  }


  async  findAll(userQueryParams: UserQueryParams) {
    const filters = QueryService.excludeFields<UserQueryParams>(userQueryParams)
    const skip = userQueryParams.page * userQueryParams.limit - userQueryParams.limit;

      return this.userModel.find(filters).select(userQueryParams.fields).sort(userQueryParams.sort).limit(userQueryParams.limit).skip(skip)
    }

    async findOne(id: User['id']) {
    const user = await this.userModel.findById(id)

      if (!user) {throw new BadRequestException('Пользователь не существует')}

      return user

    }

    async updateMe(userId: User['id'], { name, email }: UpdateMeDto, avatar: Express.Multer.File) {
    let image: string

    if (avatar) {
      try {
        image = await this.cloudinaryService.uploadFile(avatar)
      } catch (e) {
        throw new InternalServerErrorException(e.message)
      }
    }


    const obj = { ...(name && {name}),  ...(email && {email}), ...(image && {avatar: image})}

    const user =  await this.userModel.findByIdAndUpdate(userId, obj, {new: true})

      if (!user) {throw new BadRequestException('Пользователь не существуте')}

      return user
    }
}