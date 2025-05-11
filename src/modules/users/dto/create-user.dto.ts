import { IsEnum, IsOptional, IsEmail, IsString } from 'class-validator';
import { UserRole, NormalUserType, AdminType } from '../entities/user.entity';

export class CreateUserDto {
  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsEnum(NormalUserType)
  normalType?: NormalUserType;

  @IsOptional()
  @IsEnum(AdminType)
  adminType?: AdminType;

  @IsEmail()
  email: string;

  @IsString()
  name: string;
}
