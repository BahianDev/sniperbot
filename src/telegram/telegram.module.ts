import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { CoinsModule } from 'src/coins/coins.module';
import { FiltersModule } from 'src/filters/filters.module';

@Module({
  providers: [TelegramService],
  exports: [TelegramService],
  imports: [CoinsModule, FiltersModule]
})
export class TelegramModule {}
