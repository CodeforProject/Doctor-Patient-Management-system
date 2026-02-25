import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn()
  patient_id: number;

  @Column()
  age: number;

  @Column()
  gender: string;

  @Column({ type: 'text', nullable: true })
  medical_notes: string;

  @Column({ nullable: true })
  mobile_number: string;

  @Column({ nullable: true })
  user_id: number;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}