// src/entities/doctor-availability.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Doctor } from './doctor.entity';

@Entity('doctor_availability')
export class DoctorAvailability {
  @PrimaryGeneratedColumn()
  availability_id: number;

  @Column()
  doctor_id: number;

  @Column({ type: 'date' })
  available_date: string;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ default: false })
  is_booked: boolean;

  @ManyToOne(() => Doctor, doctor => doctor.availabilities)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;
}