import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  NORMAL = 'normal',
}

export enum NormalUserType {
  STUDENT = 'student',
  CLUB = 'club',
  ASSOCIATION = 'association',
}

export enum AdminType {
  HEAD_OF_SA = 'head_of_sa',
  OTHER = 'other',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({
    nullable: true,
    type: 'enum',
    enum: NormalUserType,
    default: NormalUserType.STUDENT,
  })
  normalType?: NormalUserType;

  @Column({
    nullable: true,
    type: 'enum',
    enum: AdminType,
    default: AdminType.OTHER,
  })
  adminType?: AdminType;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];
}
