import { Module } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { UsersRepository } from 'src/users/users.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [ReferralService, UsersRepository, PrismaService],
  exports: [ReferralService],
  controllers: [],
})
export class ReferralModule {}
