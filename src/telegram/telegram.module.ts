import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { CoinsModule } from 'src/coins/coins.module';
import { FiltersModule } from 'src/filters/filters.module';
import { UsersModule } from 'src/users/users.module';
import { PumpFunModule } from 'src/pump-fun/pump-fun.module';

@Module({
  providers: [TelegramService],
  exports: [TelegramService],
  imports: [CoinsModule, FiltersModule, UsersModule, PumpFunModule]
})
export class TelegramModule {}
