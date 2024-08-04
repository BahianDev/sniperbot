import { Module } from '@nestjs/common';
import { PumpFunEventsService } from './pump-fun-events.service';
import { CoinsModule } from '../coins/coins.module';
import { PumpFunModule } from 'src/pump-fun/pump-fun.module';

@Module({
  providers: [PumpFunEventsService],
  imports: [CoinsModule]
})
export class PumpFunEventsModule {}
