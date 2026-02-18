import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorAvailability } from '../entities/doctor-availability.entity';
import { Doctor } from '../entities/doctor.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(DoctorAvailability) private availabilityRepository: Repository<DoctorAvailability>,
    @InjectRepository(Doctor) private doctorRepository: Repository<Doctor>,
  ) {}

  async addAvailability(doctorId: number, data: Partial<DoctorAvailability>) {
    const availability = this.availabilityRepository.create({ ...data, doctor_id: doctorId });
    return this.availabilityRepository.save(availability);
  }

  async getDoctorAvailability(doctorId: number) {
    return this.availabilityRepository.find({ where: { doctor_id: doctorId } });
  }

  async getAllDoctorsAvailability() {
    return this.availabilityRepository.find({ relations: ['doctor'] });
  }
}