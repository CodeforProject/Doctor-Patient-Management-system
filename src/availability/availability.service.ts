// src/availability/availability.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  async addAvailability(userId: number, data: any) {
    const doctor = await this.doctorRepository.findOne({ where: { user_id: userId } });
    
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found. Please create a doctor profile first.');
    }

    // Validate required fields
    if (!data.mode) {
      throw new BadRequestException('Mode is required (wave or stream)');
    }

    if (!data.availability_type) {
      throw new BadRequestException('Availability type is required (recurring or custom)');
    }

    // Validate time
    const startTime = this.sanitizeTime(data.start_time) || '09:00';
    const endTime = this.sanitizeTime(data.end_time) || '17:00';

    if (!this.isValidTime(startTime) || !this.isValidTime(endTime)) {
      throw new BadRequestException('Invalid time format. Use HH:MM format.');
    }

    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    
    if (end <= start) {
      throw new BadRequestException('End time must be after start time.');
    }

    const totalMinutes = end - start;

    // ========== WAVE MODE ==========
    if (data.mode === 'wave') {
      const slotDuration = this.sanitizeNumber(data.slot_duration);
      
      if (!slotDuration || slotDuration <= 0) {
        throw new BadRequestException('Wave mode requires slot_duration (e.g., 30, 60 minutes)');
      }

      const numberOfSlots = Math.floor(totalMinutes / slotDuration);
      
      if (numberOfSlots <= 0) {
        throw new BadRequestException('Invalid slot duration. Increase time range.');
      }

      const maxPatientsPerSlot = this.sanitizeNumber(data.max_patients) || 1;

      const availability = new DoctorAvailability();
      availability.doctor_id = doctor.doctor_id;
      availability.availability_type = data.availability_type;
      availability.mode = 'wave';
      availability.day_of_week = data.day_of_week || undefined;
      availability.available_date = data.available_date || undefined;
      availability.start_time = startTime;
      availability.end_time = endTime;
      availability.slot_duration = slotDuration;
      availability.max_patients = maxPatientsPerSlot;
      availability.max_capacity = undefined;
      availability.total_slots = numberOfSlots;
      availability.total_capacity = numberOfSlots * maxPatientsPerSlot;
      availability.is_booked = false;

      const savedAvailability = await this.availabilityRepository.save(availability);
      return this.formatWaveResponse(savedAvailability);
    }

    // ========== STREAM MODE ==========
    if (data.mode === 'stream') {
      const maxCapacity = this.sanitizeNumber(data.max_capacity);
      
      if (!maxCapacity || maxCapacity <= 0) {
        throw new BadRequestException('Stream mode requires max_capacity (e.g., 10 patients)');
      }

      const availability = new DoctorAvailability();
      availability.doctor_id = doctor.doctor_id;
      availability.availability_type = data.availability_type;
      availability.mode = 'stream';
      availability.day_of_week = data.day_of_week || undefined;
      availability.available_date = data.available_date || undefined;
      availability.start_time = startTime;
      availability.end_time = endTime;
      availability.slot_duration = undefined;
      availability.max_patients = undefined;
      availability.max_capacity = maxCapacity;
      availability.total_slots = 0;
      availability.total_capacity = maxCapacity;
      availability.is_booked = false;

      const savedAvailability = await this.availabilityRepository.save(availability);
      return this.formatStreamResponse(savedAvailability);
    }

    throw new BadRequestException('Mode must be "wave" or "stream"');
  }

  async getDoctorAvailability(doctorId: number) {
    const availabilities = await this.availabilityRepository.find({ 
      where: { doctor_id: doctorId } 
    });
    
    if (!availabilities.length) {
      return { success: false, message: 'No availability found', availabilities: [] };
    }
    
    return {
      success: true,
      count: availabilities.length,
      availabilities: availabilities.map((avail) => 
        avail.mode === 'wave' ? this.formatWaveResponse(avail) : this.formatStreamResponse(avail)
      ),
    };
  }

  async getAllDoctorsAvailability() {
    const availabilities = await this.availabilityRepository.find({ 
      relations: ['doctor'] 
    });
    
    return {
      success: true,
      count: availabilities.length,
      availabilities: availabilities.map((avail) => 
        avail.mode === 'wave' ? this.formatWaveResponse(avail) : this.formatStreamResponse(avail)
      ),
    };
  }

  private formatWaveResponse(avail: DoctorAvailability): any {
    const startTime = avail.start_time || '09:00';
    const endTime = avail.end_time || '17:00';
    const slotDuration = avail.slot_duration || 30;
    const maxPatientsPerSlot = avail.max_patients || 1;

    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    const totalMinutes = end - start;
    const numberOfSlots = Math.floor(totalMinutes / slotDuration);
    
    const slots: any[] = [];
    for (let i = 0; i < numberOfSlots; i++) {
      const slotStart = start + (i * slotDuration);
      const slotEnd = slotStart + slotDuration;
      
      slots.push({
        slot_number: i + 1,
        start_time: this.minutesToTime(slotStart),
        end_time: this.minutesToTime(slotEnd),
        capacity: maxPatientsPerSlot,
        remaining: maxPatientsPerSlot,
      });
    }

    return {
      availability_id: avail.availability_id,
      doctor_id: avail.doctor_id,
      availability_type: avail.availability_type,
      mode: 'wave',
      day_of_week: avail.day_of_week,
      available_date: avail.available_date,
      time_window: { start: startTime, end: endTime, duration_minutes: totalMinutes },
      slot_duration_minutes: slotDuration,
      total_slots: numberOfSlots,
      total_capacity: numberOfSlots * maxPatientsPerSlot,
      is_booked: avail.is_booked,
      wave_info: { description: 'Fixed time slots.  Patients book specific slots.', patients_per_slot: maxPatientsPerSlot },
      slots: slots,
    };
  }

  private formatStreamResponse(avail: DoctorAvailability): any {
    const startTime = avail.start_time || '09:00';
    const endTime = avail.end_time || '17:00';
    const maxCapacity = avail.max_capacity || 10;

    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    const totalMinutes = end - start;

    return {
      availability_id: avail.availability_id,
      doctor_id: avail.doctor_id,
      availability_type: avail.availability_type,
      mode: 'stream',
      day_of_week: avail.day_of_week,
      available_date: avail.available_date,
      time_window: { start: startTime, end: endTime, duration_minutes: totalMinutes },
      max_capacity: maxCapacity,
      booked_patients: 0,
      remaining_capacity: maxCapacity,
      is_booked: avail.is_booked,
      stream_info: {
        description: 'First come first serve.',
        booking_type: 'Open window booking',
        max_patients: maxCapacity,
        time_range: `${startTime} to ${endTime}`,
      },
    };
  }

  // ========== HELPER: Sanitize Number ==========
  private sanitizeNumber(value: any): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }

  // ========== HELPER: Sanitize Time ==========
  private sanitizeTime(value: any): string | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    return String(value).trim();
  }

  // ========== HELPER: Time to Minutes ==========
  private timeToMinutes(time: string): number {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  }

  // ========== HELPER: Minutes to Time ==========
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // ========== HELPER: Validate Time Format ==========
  private isValidTime(time: string | undefined): boolean {
    if (!time) return false;
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
  }
}