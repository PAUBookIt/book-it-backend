import { IsUUID, IsDateString } from 'class-validator';

export class CreateReservationDto {
  @IsUUID()
  classroomId: string;

  @IsUUID()
  userId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}
