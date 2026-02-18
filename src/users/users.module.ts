import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../entities/user.entity';
import { Patient } from '../entities/patient.entity';
import { Doctor } from '../entities/doctor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Patient, Doctor])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}