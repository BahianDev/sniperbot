import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramModule } from './telegram/telegram.module';
import { ScrapingModule } from './scraping/scraping.module';
import { PumpFunEventsModule } from './pump-fun-events/pump-fun-events.module';
import { CoinsModule } from './coins/coins.module';
import { PrismaModule } from './prisma/prisma.module';
import { PumpFunModule } from './pump-fun/pump-fun.module';
import { FiltersModule } from './filters/filters.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    UsersModule,
    TelegramModule,
    ScrapingModule,
    PumpFunEventsModule,
    CoinsModule,
    PrismaModule,
    PumpFunModule,
    FiltersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
