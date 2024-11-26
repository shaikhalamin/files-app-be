import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { email } = createUserDto;

      const existingUser = await this.userRepository.findOne({
        where: { email: email },
      });

      if (existingUser) {
        throw new ConflictException('Email already in use');
      }

      const user = this.userRepository.create(createUserDto);
      const savedUser = await this.userRepository.save(user);
      return savedUser;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      return await this.userRepository.find({
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          is_active: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string, relation?: string[]): Promise<User> {
    try {
      const user: User = await this.userRepository.findOne({
        relations: relation && relation,
        where: { id: id },
      });
      if (!user) {
        throw new NotFoundException('User not found !');
      }
      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ email: email });
      if (!user) {
        throw new NotFoundException('User not found !');
      }
      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findByPhoneNumber(phone: string): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({
        phone: phone,
      });
      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      let user = await this.findOne(id);
      user = Object.assign(user, {
        ...updateUserDto,
      });
      if (updateUserDto?.password) {
        user.password = user.passwordHash(updateUserDto.password);
      }
      await this.userRepository.update(id, user);

      return this.findOne(user.id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
