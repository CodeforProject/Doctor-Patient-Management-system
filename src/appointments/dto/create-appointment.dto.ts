// src/appointments/dto/create-appointment.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsDateString, Matches } from 'class-validator';
import { AppointmentStatus } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsDateString()
  @IsNotEmpty()
  appointmentDate: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'appointmentTime must be in HH:MM format (24-hour)',
  })
  appointmentTime: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateAppointmentDto {
  @IsDateString()
  @IsOptional()
  appointmentDate?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'appointmentTime must be in HH:MM format (24-hour)',
  })
  appointmentTime?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsOptional()
  status?: AppointmentStatus;
}