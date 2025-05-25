import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, NormalUserType, AdminType } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    enum: UserRole,
    description: 'Role of the user',
    example: UserRole.NORMAL,
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({
    enum: NormalUserType,
    description: 'Type of normal user (student, club, association)',
    default: NormalUserType.STUDENT,
    example: NormalUserType.STUDENT,
  })
  @IsEnum(NormalUserType)
  @IsOptional()
  normalType?: NormalUserType;

  @ApiPropertyOptional({
    enum: AdminType,
    description: 'Type of admin user',
    default: AdminType.OTHER,
    example: AdminType.HEAD_OF_SA,
  })
  @IsEnum(AdminType)
  @IsOptional()
  adminType?: AdminType;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'Jane Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'jane.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the user account',
    minLength: 6,
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
