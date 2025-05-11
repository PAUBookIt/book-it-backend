import { Room } from 'src/modules/rooms/entities/room.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum ReservationStatus {
  APPROVED = 'approved',
  DENIED = 'denied',
  PENDING = 'pending',
}

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Room, (room) => room.reservation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  room: Room;

  @ManyToOne(() => User, (user) => user.reservations)
  user: User;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @CreateDateColumn()
  createdAt: Date;
}
