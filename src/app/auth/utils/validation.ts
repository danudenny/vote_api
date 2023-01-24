import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export async function comparePassword(
  plain: string,
  hashed: string,
): Promise<boolean> {
  const compare = await bcrypt.compare(plain, hashed);
  if (!compare) throw new BadRequestException('Wrong Password!');
  return true;
}

export async function checkDob(dob: Date): Promise<any> {
  const checkDate = new Date().getFullYear() - new Date(dob).getFullYear();
  if (checkDate < 12) throw new BadRequestException('Minimum age must be 12!');
}

export async function checkEmail(email: string): Promise<boolean> {
  const getEmail = await this.userRepo.findOne({ email });
  if (!getEmail) throw new NotFoundException('Email not found');
  return true;
}
