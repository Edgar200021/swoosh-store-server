import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { SignUpDto } from 'src/iam/dto/sign-up.dto';

@ValidatorConstraint({ async: false, name: 'isPasswordMatching' })
export class IsPasswordMatchingConstraint
  implements ValidatorConstraintInterface
{
  validate(value: string, validationArguments?: ValidationArguments): boolean {
    const obj = validationArguments.object as SignUpDto;
    return obj.password === value;
  }

  defaultMessage() {
    return 'Пароли не совпадают';
  }
}
