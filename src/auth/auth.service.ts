import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password_hash))) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.user_id, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }

  async googleLogin(profile: any) {
    let user = await this.userRepository.findOne({ where: { email: profile.email } });
    if (!user) {
      user = this.userRepository.create({
        name: profile.name,
        email: profile.email,
        phone: '', // Set later
        password_hash: '', // Not used for Google
        role: 'patient', // Default; update via endpoint
        status: 'active',
        // username: profile.name
      });
      await this.userRepository.save(user);
    }
    return this.login(user);
  }
}