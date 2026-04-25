import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashAspNetPassword } from '../utils/password.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if userName is being updated and if it's already taken
    if (updateUserDto.userName && updateUserDto.userName !== user.userName) {
      const existingUser = await this.usersRepository.findOne({
        where: { userName: updateUserDto.userName },
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('UserName is already taken');
      }
    }

    // Hash password if provided
    if (updateUserDto.password) {
      user.passwordHash = hashAspNetPassword(updateUserDto.password);
    }

    // Update other fields
    if (updateUserDto.userName !== undefined) {
      user.userName = updateUserDto.userName;
    }

    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}
