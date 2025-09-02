import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.findOne('email', createUserDto.email);

    if (existingUser) throw new BadRequestException(`Student already exists`);

    if (
      createUserDto.role === UserRole.NORMAL_USER &&
      !createUserDto.normalUserType
    ) {
      throw new BadRequestException('Normal users must specify a user type');
    }
    const newUser = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(newUser);

    const { password, ...rest } = savedUser;
    return rest;
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(searchParam: 'email' | 'id', searchValue: string) {
    const user = await this.userRepository.findOne({
      where: { [searchParam]: searchValue },
    });
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
