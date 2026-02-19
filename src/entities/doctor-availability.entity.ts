import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Doctor } from './doctor.entity';

@Entity('doctor_availability')
export class DoctorAvailability {
  @PrimaryGeneratedColumn()
  availability_id: number;

  @Column()
  doctor_id: number;

  // For custom availability: specific date (e.g., "2023-12-05")
  @Column({ type: 'date', nullable: true })
  available_date: string;

  // For recurring availability: day of week (e.g., "MONDAY", "TUESDAY")
  @Column({ nullable: true })
  day_of_week: string;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ default: false })
  is_booked: boolean;

  // Slot type: "recurring" for general schedule, "custom" for specific dates
  @Column()
  slotType: string;

  @ManyToOne(() => Doctor, doctor => doctor.availabilities)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;
}