import * as WebSocket from  'ws';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { CoinsService } from 'src/coins/coins.service';
import { PumpFunService } from 'src/pump-fun/pump-fun.service';

@Injectable()
export class PumpFunEventsService {
  private ws: WebSocket;
  private readonly logger = new Logger(PumpFunEventsService.name);
  
  constructor(
    private readonly coinsService: CoinsService,
  ) {
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket('wss://pumpportal.fun/api/data');

    this.ws.on('open', () => {
      this.logger.log('Connected to PumpFun WebSocket server');

      const payload = {
        method: "subscribeNewToken", 
      };

      this.ws.send(JSON.stringify(payload));
    });

    this.ws.on('message', (message) => {
      const data = JSON.parse(message as any);
      console.log(data);
  
      if (data?.txType === 'create') {
        this.coinsService.createCoin(data.mint);
      };
    });
  }
}
