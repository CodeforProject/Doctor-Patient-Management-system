import { Controller, Post, Body, UseGuards, Req, Get, Param } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';

@Controller('availability')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  @Post('add')
  @Roles('doctor')
  addAvailability(@Req() req, @Body() data) {
    return this.availabilityService.addAvailability(req.user.userId, data);
  }

  @Get('doctor/:doctorId')
  getDoctorAvailability(@Param('doctorId') doctorId: number) {
    return this.availabilityService.getDoctorAvailability(doctorId);
  }

  @Get('all')
  getAllDoctorsAvailability() {
    return this.availabilityService.getAllDoctorsAvailability();
  }
}