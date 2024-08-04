import { Injectable, Logger } from '@nestjs/common';
import { CoinsRepository } from './coins.repository';
import { Coins } from '@prisma/client';
import { PumpFunService } from 'src/pump-fun/pump-fun.service';

@Injectable()
export class CoinsService {
  private logger = new Logger(CoinsService.name);
  constructor(
    private readonly pumpFunService: PumpFunService,
    private readonly coinsRepository: CoinsRepository,
  ) {}

  public async createCoin(mint: string) {

    const [coinData, lastCandleStick] = await Promise.all([
      this.pumpFunService.getCoinData(mint),
      this.pumpFunService.getLastCandlestick(mint),
    ]);

    if (!coinData || coinData.statusCode || lastCandleStick?.statusCode) {
      this.logger.log(coinData, lastCandleStick)
      return;
    }

    await this.coinsRepository.createCoin({
      data: {
        ...coinData,
        last_candlestick: lastCandleStick
      },
    });
  }
}
