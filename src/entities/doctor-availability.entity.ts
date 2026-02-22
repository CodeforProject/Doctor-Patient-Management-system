import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Doctor } from './doctor.entity';

@Entity('doctor_availability')
export class DoctorAvailability {
  @PrimaryGeneratedColumn()
  availability_id: number;

  @Column()
  doctor_id: number;

  // Type: "recurring" (weekly) or "custom" (specific date)
  @Column()
  availability_type: string;

  // Mode: "wave" or "stream"
  @Column()
  mode: string;

  // For recurring: day of week (e.g., "MONDAY")
  @Column({ nullable: true })
  day_of_week: string;

  // For custom: specific date (e.g., "2023-12-05")
  @Column({ type: 'date', nullable: true })
  available_date: string;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  // Slot duration in minutes (e.g., 30, 60)
  @Column()
  slot_duration: number;

  // For wave: max patients
  @Column({ nullable: true })
  max_patients: number;

  // For stream: capacity per slot
  @Column({ nullable: true })
  capacity_per_slot: number;

  // Calculated fields stored in DB
  @Column({ nullable: true })
  total_slots: number;

  @Column({ nullable: true })
  total_capacity: number;

  @Column({ default: false })
  is_booked: boolean;

  @ManyToOne(() => Doctor, doctor => doctor.availabilities)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;
}