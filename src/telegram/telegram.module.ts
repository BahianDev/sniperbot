import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { UsersModule } from 'src/users/users.module';
import { ReferralModule } from 'src/referral/referral.module';

@Module({
  providers: [TelegramService],
  exports: [TelegramService],
  imports: [UsersModule, ReferralModule],
})
export class TelegramModule {}
