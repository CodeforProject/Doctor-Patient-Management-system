import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Patient } from '../entities/patient.entity';
import { Doctor } from '../entities/doctor.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Patient) private patientRepository: Repository<Patient>,
    @InjectRepository(Doctor) private doctorRepository: Repository<Doctor>,
  ) {}

  async createPatientProfile(userId: number, data: Partial<Patient>) {
    // Changed: Set user_id (FK) instead of patient_id (PK) to link to users table
    const patient = this.patientRepository.create({ ...data, user_id: userId });
    return this.patientRepository.save(patient);
  }

  async createDoctorProfile(userId: number, data: Partial<Doctor>) {
    // Changed: Set user_id (FK) instead of doctor_id (PK) to link to users table
    const doctor = this.doctorRepository.create({ ...data, user_id: userId });
    return this.doctorRepository.save(doctor);
  }

  async getUserProfile(userId: number, role: string) {
    if (role === 'patient') {
      // Changed: Query by user_id (FK) instead of patient_id (PK) to find the linked profile
      return this.patientRepository.findOne({ where: { user_id: userId } });
    } else if (role === 'doctor') {
      // Changed: Query by user_id (FK) instead of doctor_id (PK) to find the linked profile
      return this.doctorRepository.findOne({ where: { user_id: userId }, relations: ['availabilities'] });
    }
    return null;
  }

  // Updated: Method to set user role only (no username)
  async setUserRole(userId: number, role: string) {
    if (!['doctor', 'patient'].includes(role)) {
      throw new Error('Invalid role');
    }
    await this.userRepository.update(userId, { role });
    return { message: 'Role updated successfully' };
  }
}