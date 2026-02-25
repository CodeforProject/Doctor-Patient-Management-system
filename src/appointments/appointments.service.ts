// src/appointments/appointments.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment) private appointmentRepository: Repository<Appointment>,
  ) {}

  // ========== CREATE (BOOK) APPOINTMENT ==========
  async create(createAppointmentDto: CreateAppointmentDto) {
    const { patientId, doctorId, appointmentDate, appointmentTime } = createAppointmentDto;

    // Check if slot is available
    const isSlotAvailable = await this.checkSlotAvailability(doctorId, appointmentDate, appointmentTime);
    if (!isSlotAvailable) {
      throw new BadRequestException('This time slot is not available');
    }

    // Check if patient already has appointment with this doctor on this day
    const existingAppointment = await this.checkPatientDoctorSameDay(patientId, doctorId, appointmentDate);
    if (existingAppointment) {
      throw new BadRequestException('You already have an appointment with this doctor on this day');
    }

    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      status: AppointmentStatus.PENDING,
    });

    return this.appointmentRepository.save(appointment);
  }

  // ========== CHECK IF PATIENT HAS APPOINTMENT WITH DOCTOR ON SAME DAY ==========
  async checkPatientDoctorSameDay(patientId: string, doctorId: string, date: string): Promise<Appointment | null> {
    return this.appointmentRepository.findOne({
      where: {
        patientId,
        doctorId,
        appointmentDate: date,
        status: AppointmentStatus.PENDING,
      },
    });
  }

  // ========== GET ALL APPOINTMENTS ==========
  async findAll() {
    return this.appointmentRepository.find({
      relations: ['patient', 'doctor'],
      order: { createdAt: 'DESC' },
    });
  }

  // ========== GET SINGLE APPOINTMENT ==========
  async findOne(id: string) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });
    
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    
    return appointment;
  }

  // ========== UPDATE (RESCHEDULE) APPOINTMENT ==========
  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    const appointment = await this.findOne(id);
    
    // If changing date/time, check availability
    if (updateAppointmentDto.appointmentDate || updateAppointmentDto.appointmentTime) {
      const newDate = updateAppointmentDto.appointmentDate || appointment.appointmentDate;
      const newTime = updateAppointmentDto.appointmentTime || appointment.appointmentTime;
      
      const isAvailable = await this.checkSlotAvailability(appointment.doctorId, newDate, newTime);
      if (!isAvailable) {
        throw new BadRequestException('This time slot is not available');
      }

      // Check if patient already has appointment with this doctor on new date
      if (updateAppointmentDto.appointmentDate) {
        const existingAppointment = await this.checkPatientDoctorSameDay(
          appointment.patientId,
          appointment.doctorId,
          newDate,
        );
        if (existingAppointment && existingAppointment.id !== id) {
          throw new BadRequestException('You already have an appointment with this doctor on this date');
        }
      }
    }

    // Only allow updating certain fields
    if (updateAppointmentDto.appointmentDate) {
      appointment.appointmentDate = updateAppointmentDto.appointmentDate;
    }
    if (updateAppointmentDto.appointmentTime) {
      appointment.appointmentTime = updateAppointmentDto.appointmentTime;
    }
    if (updateAppointmentDto.reason) {
      appointment.reason = updateAppointmentDto.reason;
    }
    if (updateAppointmentDto.status) {
      appointment.status = updateAppointmentDto.status;
    }

    return this.appointmentRepository.save(appointment);
  }

  // ========== DELETE APPOINTMENT ==========
  async remove(id: string) {
    const appointment = await this.findOne(id);
    await this.appointmentRepository.remove(appointment);
    return { message: 'Appointment deleted successfully' };
  }

  // ========== GET PATIENT APPOINTMENTS ==========
  async getPatientAppointments(patientId: string) {
    return this.appointmentRepository.find({
      where: { patientId },
      relations: ['doctor'],
      order: { appointmentDate: 'ASC', appointmentTime: 'ASC' },
    });
  }

  // ========== GET DOCTOR APPOINTMENTS ==========
  async getDoctorAppointments(doctorId: string) {
    return this.appointmentRepository.find({
      where: { doctorId },
      relations: ['patient'],
      order: { appointmentDate: 'ASC', appointmentTime: 'ASC' },
    });
  }

  // ========== CHECK SLOT AVAILABILITY ==========
  async checkSlotAvailability(doctorId: string, date: string, time: string): Promise<boolean> {
    const existingAppointment = await this.appointmentRepository.findOne({
      where: {
        doctorId,
        appointmentDate: date,
        appointmentTime: time,
        status: AppointmentStatus.PENDING,
      },
    });

    return !existingAppointment;
  }

  // ========== CONFIRM APPOINTMENT ==========
  async confirmAppointment(id: string) {
    const appointment = await this.findOne(id);
    appointment.status = AppointmentStatus.CONFIRMED;
    return this.appointmentRepository.save(appointment);
  }

  // ========== CANCEL APPOINTMENT ==========
  async cancelAppointment(id: string) {
    const appointment = await this.findOne(id);
    appointment.status = AppointmentStatus.CANCELLED;
    return this.appointmentRepository.save(appointment);
  }

  // ========== COMPLETE APPOINTMENT ==========
  async completeAppointment(id: string) {
    const appointment = await this.findOne(id);
    appointment.status = AppointmentStatus.COMPLETED;
    return this.appointmentRepository.save(appointment);
  }
}