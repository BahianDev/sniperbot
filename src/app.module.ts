import { Module } from '@nestjs/common';
import { TelegramModule } from './telegram/telegram.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ReferralModule } from './referral/referral.module';

@Module({
  imports: [
    UsersModule,
    TelegramModule,
    PrismaModule,
    ReferralModule,
  ],
})
export class AppModule {}
