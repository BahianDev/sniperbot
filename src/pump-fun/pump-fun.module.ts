import { Module } from '@nestjs/common';
import { PumpFunService } from './pump-fun.service';
import { ScrapingModule } from 'src/scraping/scraping.module';

@Module({
  providers: [PumpFunService],
  exports:[PumpFunService],
  imports: [ScrapingModule],
})
export class PumpFunModule {}
