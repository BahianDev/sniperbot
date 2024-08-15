import { Injectable, Logger } from '@nestjs/common';
import {
  VersionedTransaction,
  Connection,
  Keypair,
  clusterApiUrl,
} from '@solana/web3.js';

import { ScrapingService } from 'src/scraping/scraping.service';
import * as bs58 from 'bs58';

@Injectable()
export class PumpFunService {
  private baseUrl = 'https://frontend-api.pump.fun';
  private logger = new Logger(PumpFunService.name);

  constructor(private readonly scrapingService: ScrapingService) {}

  public async getCoinData(mint: string) {
    const url = `${this.baseUrl}/coins/${mint}`;

    this.logger.log({ url });

    try {
      const content = await this.scrapingService.getDataFromPage(url);

      return content;
    } catch (e) {
      console.error(e);
      this.logger.error('Error getting coin data', e);
    }
  }

  public async createToken({
    name,
    symbol,
    description,
    twitter,
    telegram,
    website,
    publickey,
    pk,
    file,
  }: {
    name: string;
    symbol: string;
    description: string;
    twitter: string;
    telegram: string;
    website: string;
    publickey: string;
    pk: string;
    file: Blob;
  }) {
    try {
      const web3Connection = new Connection(
        clusterApiUrl('mainnet-beta'),
        'confirmed',
      );

      const signerKeyPair = Keypair.fromSecretKey(bs58.default.decode(pk));

      const formData = new FormData();

      const mintKeypair = Keypair.generate();

      formData.append('file', file);
      formData.append('name', name),
        formData.append('symbol', symbol),
        formData.append('description', description),
        formData.append('twitter', twitter),
        formData.append('telegram', telegram),
        formData.append('website', website),
        formData.append('showName', 'true');

      const metadataResponse = await fetch('https://pump.fun/api/ipfs', {
        method: 'POST',
        body: formData,
      });

      const metadataResponseJSON = await metadataResponse.json();
      console.log(metadataResponseJSON);

      const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicKey: publickey,
          action: 'create',
          tokenMetadata: {
            name: metadataResponseJSON.metadata.name,
            symbol: metadataResponseJSON.metadata.symbol,
            uri: metadataResponseJSON.metadataUri,
          },
          mint: mintKeypair.publicKey.toBase58(),
          denominatedInSol: 'true',
          amount: 0,
          slippage: 10,
          priorityFee: 0.0005,
          pool: 'pump',
        }),
      });
      console.log(response);

      if (response.status === 200) {
        // successfully generated transaction
        const data = await response.arrayBuffer();
        const tx = VersionedTransaction.deserialize(new Uint8Array(data));
        tx.sign([mintKeypair, signerKeyPair]);
        const signature = await web3Connection.sendTransaction(tx);
        console.log('Transaction: https://solscan.io/tx/' + signature);

        return 'Transaction: https://solscan.io/tx/' + signature;
      } else {
        console.log(response.statusText); // log error
      }
    } catch (error) {
      console.log(error);
    }
  }

  public async getLastCandlestick(mint: string) {
    const url = `${this.baseUrl}/candlesticks/${mint}?offset=0&limit=1&timeframe=5`;

    try {
      const content = await this.scrapingService.getDataFromPage(url);

      return content[0];
    } catch (e) {
      this.logger.error('Error getting candlestick', e);
    }
  }

  public async getCandlesticks(mint: string, limit = 100) {
    const url = `${this.baseUrl}/candlesticks/${mint}?offset=0&limit=${limit}&timeframe=5`;

    try {
      const content = await this.scrapingService.getDataFromPage(url);

      return content;
    } catch (e) {
      this.logger.error(e);
    }
  }
}
