import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../rooms/entities/room.entity';
import { User } from '../users/entities/user.entity';
import { Reservation, ReservationStatus } from './entities/reservation.entity';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepo: Repository<Reservation>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Room)
    private roomRepo: Repository<Room>,
  ) {}

  async create(dto: CreateReservationDto): Promise<Reservation> {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const room = await this.roomRepo.findOne({ where: { id: dto.roomId } });
    if (!room) throw new NotFoundException('Room not found');

    if (dto.endTime <= dto.startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const reservation = this.reservationRepo.create({
      ...dto,
      user,
      room,
      status: dto.status || ReservationStatus.PENDING,
    });

    return this.reservationRepo.save(reservation);
  }

  findAll(): Promise<Reservation[]> {
    return this.reservationRepo.find({
      relations: ['user', 'room'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepo.findOne({
      where: { id },
      relations: ['user', 'room'],
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    return reservation;
  }

  async update(id: string, dto: UpdateReservationDto): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (dto.userId) {
      const user = await this.userRepo.findOne({ where: { id: dto.userId } });
      if (!user) throw new NotFoundException('User not found');
      reservation.user = user;
    }

    if (dto.roomId) {
      const room = await this.roomRepo.findOne({ where: { id: dto.roomId } });
      if (!room) throw new NotFoundException('Room not found');
      reservation.room = room;
    }

    Object.assign(reservation, dto);
    return this.reservationRepo.save(reservation);
  }

  async remove(id: string): Promise<void> {
    const reservation = await this.findOne(id);
    await this.reservationRepo.remove(reservation);
  }
}
