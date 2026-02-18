// src/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column()
  password_hash: string;

  @Column({ type: 'enum', enum: ['doctor', 'patient'] })
  role: string;

  @Column({ default: 'active' })
  status: string;

  @CreateDateColumn()
  created_at: Date;
}