import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.entity';

@Schema()
export class Token extends Document {
  @Prop({ required: [true, 'Укажите токен'] })
  refreshToken: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Укажите ID пользователя'],
  })
  user: User;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
