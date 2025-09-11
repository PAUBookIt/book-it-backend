import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    example: 'SST Lab',
    description: 'Name of the room',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'SST, Floor 2',
    description: 'Location of the room',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    example: true,
    description: 'Availability status of the room',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}
