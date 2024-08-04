import { Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';

@Injectable()
export class ScrapingService {
  private logger = new Logger(ScrapingService.name);
  public async getDataFromPage(url: string): Promise<any> {
    const browser = await puppeteer.launch({ headless: true, devtools: true });
    try {
      const page = await browser.newPage();

      await page.goto(url, { waitUntil: 'domcontentloaded' })

      const preContent = await page.evaluate(() => {
        const preTag = document.querySelector('pre');
        return preTag ? preTag.innerText : null;
      });

      return JSON.parse(preContent);
    } catch (e) {
      this.logger.error('Erro ao buscar dados da página:', e);
      throw e;
    } finally {
      await browser.close();
    }
  }
}
