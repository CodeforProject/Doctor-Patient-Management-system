// src/entities/doctor-availability.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Doctor } from './doctor.entity';

@Entity('doctor_availability')
export class DoctorAvailability {
  @PrimaryGeneratedColumn()
  availability_id!: number;

  @Column()
  doctor_id!: number;

  @Column()
  availability_type!: string;

  @Column()
  mode!: string;

  @Column({ nullable: true })
  day_of_week?: string;

  @Column({ type: 'date', nullable: true })
  available_date?: string;

  @Column({ type: 'time' })
  start_time!: string;

  @Column({ type: 'time' })
  end_time!: string;

  @Column({ nullable: true })
  slot_duration?: number;

  @Column({ nullable: true })
  max_patients?: number;

  @Column({ nullable: true })
  max_capacity?: number;

  @Column({ nullable: true })
  total_slots?: number;

  @Column({ nullable: true })
  total_capacity?: number;

  @Column({ default: false })
  is_booked!: boolean;

  @ManyToOne(() => Doctor, (doctor) => doctor.availabilities)
  @JoinColumn({ name: 'doctor_id' })
  doctor?: Doctor;
}