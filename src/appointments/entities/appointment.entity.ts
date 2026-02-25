// src/appointments/entities/appointment.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Doctor } from 'src/entities/doctor.entity';
import { Patient } from 'src/entities/patient.entity';

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient, { eager: true })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  doctorId: string;

  @ManyToOne(() => Doctor, { eager: true })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @Column({ type: 'date' })
  appointmentDate: string;

  @Column({ type: 'time' })
  appointmentTime: string;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING
  })
  status: AppointmentStatus;

  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}