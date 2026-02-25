// src/appointments/appointments.controller.ts
import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // ========== BOOK NEW APPOINTMENT ==========
  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  // ========== GET ALL APPOINTMENTS ==========
  @Get()
  findAll() {
    return this.appointmentsService.findAll();
  }

  // ========== GET APPOINTMENTS BY PATIENT ==========
  @Get('patient/:patientId')
  getPatientAppointments(@Param('patientId') patientId: string) {
    return this.appointmentsService.getPatientAppointments(patientId);
  }

  // ========== GET APPOINTMENTS BY DOCTOR ==========
  @Get('doctor/:doctorId')
  getDoctorAppointments(@Param('doctorId') doctorId: string) {
    return this.appointmentsService.getDoctorAppointments(doctorId);
  }

  // ========== CHECK SLOT AVAILABILITY ==========
  @Get('availability')
  checkAvailability(
    @Query('doctorId') doctorId: string,
    @Query('date') date: string,
    @Query('time') time: string,
  ) {
    return this.appointmentsService.checkSlotAvailability(doctorId, date, time);
  }

  // ========== GET SINGLE APPOINTMENT ==========
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  // ========== UPDATE/RESCHEDULE APPOINTMENT ==========
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  // ========== CONFIRM APPOINTMENT ==========
  @Patch(':id/confirm')
  confirmAppointment(@Param('id') id: string) {
    return this.appointmentsService.confirmAppointment(id);
  }

  // ========== CANCEL APPOINTMENT ==========
  @Patch(':id/cancel')
  cancelAppointment(@Param('id') id: string) {
    return this.appointmentsService.cancelAppointment(id);
  }

  // ========== COMPLETE APPOINTMENT ==========
  @Patch(':id/complete')
  completeAppointment(@Param('id') id: string) {
    return this.appointmentsService.completeAppointment(id);
  }

  // ========== DELETE APPOINTMENT ==========
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}