import { Module } from '@nestjs/common';
import { CoinsService } from './coins.service';
import { CoinsController } from './coins.controller';
import { CoinsRepository } from './coins.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PumpFunModule } from 'src/pump-fun/pump-fun.module';

@Module({
  controllers: [CoinsController],
  providers: [CoinsService, CoinsRepository],
  exports:[CoinsService, CoinsRepository],
  imports: [PrismaModule, PumpFunModule]
})
export class CoinsModule {}
