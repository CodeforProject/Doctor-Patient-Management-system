import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('patient-profile')
  @Roles('patient')
  createPatientProfile(@Req() req, @Body() data: any) {
    return this.usersService.createPatientProfile(req.user.userId, data);
  }

  @Post('doctor-profile')
  @Roles('doctor')
  createDoctorProfile(@Req() req, @Body() data: any) {
    return this.usersService.createDoctorProfile(req.user.userId, data);
  }

  @Get('profile')
  getProfile(@Req() req) {
    return this.usersService.getUserProfile(req.user.userId, req.user.role);
  }

  @Post('set-role')
  setRole(@Req() req, @Body() data: { role: string }) {
    return this.usersService.setUserRole(req.user.userId, data.role);
  }
}