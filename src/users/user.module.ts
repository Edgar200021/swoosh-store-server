import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchemaFactory } from "./entity/user.entity";
import { UsersController } from "./users.controller";
import { UserService } from "./user.service";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";


@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: UserSchemaFactory
      }
    ]),
    CloudinaryModule
  ],
  controllers: [UsersController],
  providers: [UserService]
})
export class UserModule{}