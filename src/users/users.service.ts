import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  // ========== CREATE PATIENT PROFILE ==========
  async createPatientProfile(userId: number, data: Partial<Patient>) {
    // Check if profile already exists
    const existingPatient = await this.patientRepository.findOne({
      where: { user_id: userId },
    });

    if (existingPatient) {
      throw new BadRequestException('Patient profile already exists');
    }

    // Create patient profile
    const patient = this.patientRepository.create({
      ...data,
      user_id: userId,
    });

    const savedPatient = await this.patientRepository.save(patient);

    // Return full profile with user data (including name)
    return this.getPatientWithUser(savedPatient.patient_id);
  }

  // ========== CREATE DOCTOR PROFILE ==========
  async createDoctorProfile(userId: number, data: Partial<Doctor>) {
    // Check if profile already exists
    const existingDoctor = await this.doctorRepository.findOne({
      where: { user_id: userId },
    });

    if (existingDoctor) {
      throw new BadRequestException('Doctor profile already exists');
    }

    // Create doctor profile
    const doctor = this.doctorRepository.create({
      ...data,
      user_id: userId,
    });

    const savedDoctor = await this.doctorRepository.save(doctor);

    // Return full profile with user data (including name)
    return this.getDoctorWithUser(savedDoctor.doctor_id);
  }

  // ========== GET USER PROFILE ==========
  async getUserProfile(userId: number, role: string) {
    if (role === 'patient') {
      return this.getPatientWithUserByUserId(userId);
    } else if (role === 'doctor') {
      return this.getDoctorWithUserByUserId(userId);
    }
    return null;
  }

  // ========== SET USER ROLE ==========
  async setUserRole(userId: number, role: string) {
    if (!['doctor', 'patient'].includes(role)) {
      throw new BadRequestException('Invalid role. Must be "doctor" or "patient"');
    }
    await this.userRepository.update(userId, { role });
    return { message: 'Role updated successfully', role };
  }

  // ========== HELPER: Get Patient with User Data ==========
  async getPatientWithUser(patientId: number) {
    const patient = await this.patientRepository.findOne({
      where: { patient_id: patientId },
      relations: ['user'],
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return {
      patient_id: patient.patient_id,
      name: patient.user?.name || '',
      email: patient.user?.email || '',
      age: patient.age,
      gender: patient.gender,
      medical_notes: patient.medical_notes,
      mobile_number: patient.mobile_number,
      user_id: patient.user_id,
      created_at: patient.user?.created_at,
    };
  }

  // ========== HELPER: Get Patient by User ID ==========
  async getPatientWithUserByUserId(userId: number) {
    const patient = await this.patientRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });

    if (!patient) {
      return {
        success: false,
        message: 'Patient profile not found',
        hasProfile: false,
        user_id: userId,
      };
    }

    return {
      success: true,
      patient_id: patient.patient_id,
      name: patient.user?.name || '',
      email: patient.user?.email || '',
      age: patient.age,
      gender: patient.gender,
      medical_notes: patient.medical_notes,
      mobile_number: patient.mobile_number,
      user_id: patient.user_id,
      hasProfile: true,
    };
  }

  // ========== HELPER: Get Doctor with User Data ==========
  async getDoctorWithUser(doctorId: number) {
    const doctor = await this.doctorRepository.findOne({
      where: { doctor_id: doctorId },
      relations: ['user'],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return {
      doctor_id: doctor.doctor_id,
      name: doctor.user?.name || '',
      email: doctor.user?.email || '',
      specialization: doctor.specialization,
      license_number: doctor.license_number,
      bio: doctor.bio,
      experience_years: doctor.experience_years,
      consultation_fee: doctor.consultation_fee,
      is_available: doctor.is_available,
      status: doctor.status,
      user_id: doctor.user_id,
      created_at: doctor.user?.created_at,
    };
  }

  // ========== HELPER: Get Doctor by User ID ==========
  async getDoctorWithUserByUserId(userId: number) {
    const doctor = await this.doctorRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });

    if (!doctor) {
      return {
        success: false,
        message: 'Doctor profile not found',
        hasProfile: false,
        user_id: userId,
      };
    }

    return {
      doctor_id: doctor.doctor_id,
      name: doctor.user?.name || '',
      email: doctor.user?.email || '',
      specialization: doctor.specialization,
      license_number: doctor.license_number,
      bio: doctor.bio,
      experience_years: doctor.experience_years,
      consultation_fee: doctor.consultation_fee,
      is_available: doctor.is_available,
      status: doctor.status,
      user_id: doctor.user_id,
      hasProfile: true,
    };
  }
}