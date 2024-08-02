import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramModule } from './telegram/telegram.module';
import { ScrapingModule } from './scraping/scraping.module';

@Module({
  imports: [TelegramModule, ScrapingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
