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

  async addAvailability(userId: number, data: Partial<DoctorAvailability>) {
    const doctor = await this.doctorRepository.findOne({ where: { user_id: userId } });
    if (!doctor) {
      throw new Error('Doctor profile not found');
    }
    
    const availability = this.availabilityRepository.create({
      ...data,
      doctor_id: doctor.doctor_id,
    });
    return this.availabilityRepository.save(availability);
  }

  async getDoctorAvailability(doctorId: number) {
    return this.availabilityRepository.find({ where: { doctor_id: doctorId } });
  }

  async getAllDoctorsAvailability() {
    return this.availabilityRepository.find({ relations: ['doctor'] });
  }
}