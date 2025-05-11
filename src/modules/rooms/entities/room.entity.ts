import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  location: string;

  @Column({ default: true })
  isAvailable: boolean;

  @OneToOne(() => Reservation, (reservation) => reservation.room, {
    nullable: true,
  })
  reservation?: Reservation;
}
