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

    // Calculate slots
    const startTime = data.start_time || '00:00';
    const endTime = data.end_time || '00:00';
    const slotDuration = data.slot_duration || 30;

    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    const totalMinutes = end - start;

    const numberOfSlots = Math.floor(totalMinutes / slotDuration);
    const totalCapacity = numberOfSlots;

    // Create availability with calculated values
    const availability = this.availabilityRepository.create({
      ...data,
      doctor_id: doctor.doctor_id,
      total_slots: numberOfSlots,
      total_capacity: totalCapacity,
    });

    const savedAvailability = await this.availabilityRepository.save(availability);

    // Return with slots
    return this.calculateSlots(savedAvailability);
  }

  async getDoctorAvailability(doctorId: number) {
    const availabilities = await this.availabilityRepository.find({ 
      where: { doctor_id: doctorId } 
    });
    return availabilities.map((avail: DoctorAvailability) => this.calculateSlots(avail));
  }

  async getAllDoctorsAvailability() {
    const availabilities = await this.availabilityRepository.find({ 
      relations: ['doctor'] 
    });
    return availabilities.map((avail: DoctorAvailability) => this.calculateSlots(avail));
  }

  private calculateSlots(avail: DoctorAvailability): any {
    const startTime = avail.start_time || '00:00';
    const endTime = avail.end_time || '00:00';
    const slotDuration = avail.slot_duration || 30;

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
        capacity: 1,
        patient_number: i + 1
      });
    }

    return {
      ...avail,
      slot_duration_minutes: slotDuration,
      slots: slots
    };
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}