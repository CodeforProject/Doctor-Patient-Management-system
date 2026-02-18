import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { DoctorAvailability } from './doctor-availability.entity';
import { User } from './user.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  doctor_id: number;

  @Column()
  specialization: string;

  @Column()
  experience_years: number;

  @Column('float')
  consultation_fee: number;

  @Column({ type: 'text', nullable: true })
  about: string;

  @Column('float', { default: 0 })
  rating: number;

  @Column({ default: true })
  is_available: boolean;

  @Column({ nullable: true })
  user_id: number;

  @OneToMany(() => DoctorAvailability, availability => availability.doctor)
  availabilities: DoctorAvailability[];

  @OneToOne(() => User, { cascade: true })
  @JoinColumn({ name: 'user_id' })  // FK on doctors table
  user: User;
}