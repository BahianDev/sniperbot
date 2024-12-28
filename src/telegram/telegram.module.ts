import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [TelegramService],
  exports: [TelegramService],
  imports: [UsersModule],
})
export class TelegramModule {}
