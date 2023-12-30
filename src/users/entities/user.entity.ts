import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { hash } from 'bcrypt';
import { Document } from 'mongoose';
import { UserRole } from '../enums/user-roles.enum';

@Schema()
export class User extends Document {
  @Prop()
  name: string;

  @Prop({
    unique: true,
    required: [true, 'Укажите эл. адрес пользователя'],
  })
  email: string;

  @Prop({ minlength: 10, required: [true, 'Укажите пароль'] })
  password: string;

  @Prop({
    validate: {
      validator: function (val: string) {
        return this.password === val;
      },
      message: 'Пароли не совпадают',
    },
  })
  passwordConfirm: string;

  @Prop({
    enum: [
      {
        values: [UserRole.ADMIN, UserRole.USER],
        message: '{VALUE} роль отличается от admin, user',
      },
    ],
    default: 'user',
  })
  role: string;

  @Prop()
  passwordResetToken: string;

  @Prop()
  passwordResetExpires: Date;

  @Prop()
  verificationToken: string;

  @Prop()
  verificationTokenExpires: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

export const UserSchemaFactory = () => {
  UserSchema.pre<User>('save', async function (next) {
    if (!this.isModified('password')) return next();

    const hashedPassword = await hash(this.password, 12);

    this.password = hashedPassword;
    this.passwordConfirm = undefined;

    next();
  });

  return UserSchema;
};
