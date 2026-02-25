import { Controller, Post, Body, UseGuards, Req, Get, Param } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';

@Controller('availability')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  // ========== ADD WAVE AVAILABILITY (Fixed Slots) ==========
  @Post('wave')
  @Roles('doctor')
  addWaveAvailability(@Req() req, @Body() data: any) {
    return this.availabilityService.addAvailability(req.user.userId, {
      ...data,
      mode: 'wave',
    });
  }

  // ========== ADD STREAM AVAILABILITY (First Come First Serve) ==========
  @Post('stream')
  @Roles('doctor')
  addStreamAvailability(@Req() req, @Body() data: any) {
    return this.availabilityService.addAvailability(req.user.userId, {
      ...data,
      mode: 'stream',
    });
  }

  // ========== ADD AVAILABILITY (Auto-detect mode) ==========
  @Post('add')
  @Roles('doctor')
  addAvailability(@Req() req, @Body() data: any) {
    return this.availabilityService.addAvailability(req.user.userId, data);
  }

  // ========== GET DOCTOR AVAILABILITY ==========
  @Get('doctor/:doctorId')
  getDoctorAvailability(@Param('doctorId') doctorId: number) {
    return this.availabilityService.getDoctorAvailability(doctorId);
  }

  // ========== GET ALL DOCTORS AVAILABILITY ==========
  @Get('all')
  getAllDoctorsAvailability() {
    return this.availabilityService.getAllDoctorsAvailability();
  }
}