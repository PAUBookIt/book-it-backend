import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID, IsDateString } from 'class-validator';
import { ReservationStatus } from '../entities/reservation.entity';

export class CreateReservationDto {
  @ApiProperty({
    example: 'a3f8c9e0-2b67-4e0f-9c5d-7b36f3a21e41',
    description: 'UUID of the user making the reservation',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: 'c7a81c48-1f23-42a7-93d1-71f912d38d62',
    description: 'UUID of the room being reserved',
  })
  @IsUUID()
  roomId: string;

  @ApiProperty({
    example: '2025-09-08T14:30:00Z',
    description: 'Start time of the reservation (ISO 8601 format)',
  })
  @IsDateString()
  startTime: Date;

  @ApiProperty({
    example: '2025-09-08T16:30:00Z',
    description: 'End time of the reservation (ISO 8601 format)',
  })
  @IsDateString()
  endTime: Date;

  @ApiProperty({
    example: 'Team project meeting',
    description: 'Purpose of the reservation',
  })
  @IsNotEmpty()
  purpose: string;

  @ApiProperty({
    enum: ReservationStatus,
    example: ReservationStatus.PENDING,
    required: false,
  })
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;
}
