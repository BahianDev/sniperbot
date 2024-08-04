import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ScrapingService } from 'src/scraping/scraping.service';

@Injectable()
export class PumpFunService {
  private baseUrl = 'https://frontend-api.pump.fun';
  private logger = new Logger(PumpFunService.name);

  constructor(
    private readonly scrapingService: ScrapingService,
  ){}

  public async getCoinData(mint: string) {
    const url = `${this.baseUrl}/coins/${mint}`;

    this.logger.log({url})
    
    try {
      const content = await this.scrapingService.getDataFromPage(url)

      return content
      
    } catch (e) {
      console.error(e)
      this.logger.error('Error getting coin data', e);
    }
  }
  
  public async getLastCandlestick(mint: string) {
    const url =  `${this.baseUrl}/candlesticks/${mint}?offset=0&limit=1&timeframe=5`;
    
    try {
      const content = await this.scrapingService.getDataFromPage(url)

      return content[0];
    } catch (e) {
      this.logger.error('Error getting candlestick', e);
    }
  }


  public async getCandlesticks(mint: string, limit = 100) {
    const url =  `${this.baseUrl}/candlesticks/${mint}?offset=0&limit=${limit}&timeframe=5`;

    try {
      const content = await this.scrapingService.getDataFromPage(url);

      return content;
    } catch (e) {
      this.logger.error(e);
    }
  }
}
