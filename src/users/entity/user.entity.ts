import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserRoles } from '../enums/user-roles.enum';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop()
  name: string;

  @Prop({
    required: [true, 'Укажите эл.адрес пользователя'],
    unique: true,
  })
  email: string;

  @Prop({
    required: [true, 'Укажите пароль пользователя'],
    minlength: [8, 'Минимальная длина пароля 8'],
    select: false,
  })
  password: string;

  @Prop({
    required: [true],
  })
  passwordConfirm: string;

  @Prop({
    type: [String],
    enum: {
      values: [UserRoles.ADMIN, UserRoles.USER],
      message: `{VALUE} отличается от ${UserRoles.ADMIN}, ${UserRoles.USER}`,
    },
    default: [UserRoles.USER],
  })
  role: UserRoles[];

  @Prop()
  passwordResetToken: string;

  @Prop()
  passwordResetExpires: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

export const UserSchemaFactory = () => {
  UserSchema.pre('save', function (next) {
    if (!this.passwordConfirm) return next();

    this.passwordConfirm = undefined;
    return next();
  });

  return UserSchema;
};
