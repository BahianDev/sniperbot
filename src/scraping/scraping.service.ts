import { Injectable } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { ScrapingConfig } from '../../config';

@Injectable()
export class ScrapingService {
  private config: typeof ScrapingConfig;
  private cookies = [
    {
      name: 'bullx-token',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIweDU5ZGMwMTE3NDBlZDQ4OTYxZjFmYjA1MDNjMDQwNDUyMmM4OTdlYmEiLCJpYXQiOjE3MjI0Nzk3MzUsImV4cCI6MTczMDI1NTczNX0.owrVa_IewjTrAyFC36-LLv5iF65wxdxlhqt0Ddm7D5I',
      domain: 'bullx.io',
      path: '/',
      expires: 1730255735.644651,
      size: 211,
      httpOnly: true,
      secure: false,
      session: false,
      sameParty: false,
    }
  ];

  constructor() {
    this.config = ScrapingConfig;
    
    if (!this.config.BULLX_URL) {
      throw new Error('BULLX_URL is not defined');
    }

    this.getDataFromPage();
  }

  async getDataFromPage(): Promise<any> {
    try {
      const browser = await puppeteer.launch({ headless: false, devtools: true,  });
      const page = await browser.newPage();

      // const cookies = [
      //   {
      //     name: 'mp_ec0f5c39312fa476b16b86e4f6a1c9dd_mixpanel',
      //     value: '%7B%22distinct_id%22%3A%20%22%24device%3A1910b86ea3e398-09628a00718eb7-18525637-1fa400-1910b86ea3e398%22%2C%22%24device_id%22%3A%20%221910b86ea3e398-09628a00718eb7-18525637-1fa400-1910b86ea3e398%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%7D',
      //     domain: '.bullx.io'
      //   },
      //   {
      //     name: 'mp_ec0f5c39312fa476b16b86e4f6a1c9dd_mixpanel',
      //     value: '%7B%22distinct_id%22%3A%20%22%24device%3A1910b86ea3e398-09628a00718eb7-18525637-1fa400-1910b86ea3e398%22%2C%22%24device_id%22%3A%20%221910b86ea3e398-09628a00718eb7-18525637-1fa400-1910b86ea3e398%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%7D',
      //     domain: '.bullx.io'
      //   }
      // ];

      // console.log({ sessions, locals });
      await page.goto(this.config.BULLX_URL);

      await page.evaluate(() => {
        const locals = [
          { key: 'showWelcomePage', value: 'false' },
          { key: 'selectedWallets', value: '{"wallets":[]}' },
          {
            key: 'globalObjSyncedAt',
            value: '{"tradingWallets":1722479742290,"tradingWalletsVersion":1722479742290,"walletsGroupedByToken":1722479742290,"walletsGroupedByTokenVersion":1722479742290,"walletsGroupedByTokenClosed":1722479742290,"notifications":1722479741854,"watchList":1722479742197,"version":1722479742791}'
          },
          { key: 'side-bar-auto-expand-state', value: 'false' },
          { key: 'r8bn1', value: 'false' },
          {
            key: 'majorTokens',
            value: '[{"id":"0x912ce59144191c1204e64559fe8253a0e49e6548_42161","address":"0x912ce59144191c1204e64559fe8253a0e49e6548","chainId":42161,"image":"https://image.bullx.io/42161/0x912ce59144191c1204e64559fe8253a0e49e6548","name":"Arbitrum","symbol":"ARB","percChange24h":-0.381880837524634,"priceNative":0.00020504616822940598,"totalVol24h":5653974.531119823},{"id":"0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe_56","address":"0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe","chainId":56,"image":"https://image.bullx.io/56/0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe","name":"XRP Token","symbol":"XRP","percChange24h":-4.1235073587602535,"priceNative":0.00107338,"totalVol24h":101212.31603497396},{"id":"0xba2ae424d960c26247dd6c32edc70b295c744c43_56","address":"0xba2ae424d960c26247dd6c32edc70b295c744c43","chainId":56,"image":"https://image.bullx.io/56/0xba2ae424d960c26247dd6c32edc70b295c744c43","name":"Dogecoin","symbol":"DOGE","percChange24h":-1.1283008616324837,"priceNative":0.000212768,"totalVol24h":570180.1124736776},{"id":"0x2260fac5e5542a773aa44fbcfedf7c193bc2c599_1","address":"0x2260fac5e5542a773aa44fbcfedf7c193bc2c599","chainId":1,"image":"https://image.bullx.io/1/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599","name":"Wrapped BTC","symbol":"WBTC","percChange24h":-0.26127392052718357,"priceNative":20.042357455602648,"totalVol24h":69701425.94654392},{"id":"0x4338665cbb7b2485a8855a139b75d5e34ab0db94_56","address":"0x4338665cbb7b2485a8855a139b75d5e34ab0db94","chainId":56,"image":"https://image.bullx.io/56/0x4338665cbb7b2485a8855a139b75d5e34ab0db94","name":"Litecoin Token","symbol":"LTC","percChange24h":0.9888894855490962,"priceNative":0.124401,"totalVol24h":4309.660060504101},{"id":"0xd31a59c85ae9d8edefec411d448f90841571b89c_1","address":"0xd31a59c85ae9d8edefec411d448f90841571b89c","chainId":1,"image":"https://image.bullx.io/1/0xd31a59c85ae9d8edefec411d448f90841571b89c","name":"Wrapped SOL","symbol":"SOL","percChange24h":-3.1891409582796153,"priceNative":0.05333537735833522,"totalVol24h":1473580.3078045053},{"id":"0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2_1","address":"0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2","chainId":1,"image":"https://image.bullx.io/1/0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2","name":"Maker","symbol":"MKR","percChange24h":2.8952147946042435,"priceNative":0.8697990896274671,"totalVol24h":6111197.119674548},{"id":"0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce_1","address":"0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce","chainId":1,"image":"https://image.bullx.io/1/0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce","name":"SHIBA INU","symbol":"SHIB","percChange24h":-0.7418557912448371,"priceNative":4.91782e-9,"totalVol24h":273037.8297767635},{"id":"0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9_1","address":"0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9","chainId":1,"image":"https://image.bullx.io/1/0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9","name":"Aave Token","symbol":"AAVE","percChange24h":2.669543481867018,"priceNative":0.03325567577842684,"totalVol24h":536930.0605862348},{"id":"0x1f9840a85d5af5bf1d1762f925bdaddc4201f984_1","address":"0x1f9840a85d5af5bf1d1762f925bdaddc4201f984","chainId":1,"image":"https://image.bullx.io/1/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984","name":"Uniswap","symbol":"UNI","percChange24h":-0.5978338618805322,"priceNative":0.002238621710428561,"totalVol24h":1310127.8459057508},{"id":"0x5a98fcbea516cf06857215779fd812ca3bef1b32_1","address":"0x5a98fcbea516cf06857215779fd812ca3bef1b32","chainId":1,"image":"https://image.bullx.io/1/0x5a98fcbea516cf06857215779fd812ca3bef1b32","name":"Lido DAO Token","symbol":"LDO","percChange24h":3.5472214700896614,"priceNative":0.000501794371696332,"totalVol24h":317381.00400218647}]'
          },
          {
            key: 'jitoBundleTip',
            value: '{"percentile99":0.02200082045,"emaPercentile50":0.000004262960000119025,"percentile75":0.000022322,"timestamp":null,"percentile95":0.007495000000000001,"percentile25":0.0000010000000000000002,"percentile50":0.000005}'
          },
          {
            key: 'pusherTransportTLS',
            value: '{"timestamp":1722479735173,"transport":"ws","latency":507,"cacheSkipCount":0}'
          },
          {
            key: 'gasFees',
            value: '{"1":4.009150861,"56":1,"8453":0.007200587,"42161":0.01,"81457":0.001014712,"1399811149":0.0015}'
          },
          {
            key: 'announcement',
            value: '{"id":"udad3ss7","textColor":"#459C6E","link":null,"text":null,"backgroundColor":"#12201A"}'
          },
          { key: 'referralV2', value: 'undefined' },
          {
            key: 'allWalletNativeBalancesStored',
            value: '{"BQWDMPqbeBVRykb3bFsjaQbmBykTMFozYBeebPRqT3FB":{"1399811149":0},"0xd23e356a9a0a668e43f04d79b3541ce826fa8886":{"1":"0","56":"0","8453":"0","42161":"0","81457":"0"}}'
          },
          {
            key: 'wNativeUSDPrices',
            value: '{"1":"3193.9318986420076","56":"572.7221466507974","8453":"3192.5620751822003","42161":"3195.324288420489","81457":"3199.9360171480653","1399811149":"170.5904903926945"}'
          },
          { key: 'currentActiveTabV2', value: 'wo5m8mvrdai' },
          { key: 'registeredTabsNewPairs', value: '{}' },
          { key: 'currentActiveTabSyncedV2', value: '1722479764841' },
          { key: 'i18nextLng', value: 'en' },
          {
            key: 'tradingWalletsAddresses',
            value: '["0xd23e356a9a0a668e43f04d79b3541ce826fa8886","BQWDMPqbeBVRykb3bFsjaQbmBykTMFozYBeebPRqT3FB"]'
          },
          {
            key: 'LoginInfo',
            value: '{"loggedIn":true,"loggedInUser":{"uid":"0x59dc011740ed48961f1fb0503c0404522c897eba","emailVerified":false,"isAnonymous":false,"providerData":[],"stsTokenManager":{"refreshToken":"AMf-vBxlfUwLxG7OFTamNnuflf-Rwy06adK51D9mHnmAe6G6rzEqB33-54ZQ3u--6gK2Hl2Lmm6cVWCt191nJOGDRwnT0P9AGJlzLskUSGwFZ7CJ-pjRyTiTjSC92-eHYtBx196aBw3AsGfoWcFxBeTFMGlLdAyO76RUTYcrvQnzCVgq0ZDVmPIFYwba_KT8cPsgorsyJZv9RbsbiBs7WficlkgeMReRfGoePHAbjh7Iic0z-TAtgpQ","accessToken":"eyJhbGciOiJSUzI1NiIsImtpZCI6IjBjYjQyNzQyYWU1OGY0ZGE0NjdiY2RhZWE0Yjk1YTI5ZmJhMGM1ZjkiLCJ0eXAiOiJKV1QifQ.eyJsb2dpblZhbGlkVGlsbCI6IjIwMjQtMTAtMzBUMDI6MzU6MzUuMjczWiIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9ic2ctdjIiLCJhdWQiOiJic2ctdjIiLCJhdXRoX3RpbWUiOjE3MjI0Nzk3MzYsInVzZXJfaWQiOiIweDU5ZGMwMTE3NDBlZDQ4OTYxZjFmYjA1MDNjMDQwNDUyMmM4OTdlYmEiLCJzdWIiOiIweDU5ZGMwMTE3NDBlZDQ4OTYxZjFmYjA1MDNjMDQwNDUyMmM4OTdlYmEiLCJpYXQiOjE3MjI0Nzk3MzcsImV4cCI6MTcyMjQ4MzMzNywiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6e30sInNpZ25faW5fcHJvdmlkZXIiOiJjdXN0b20ifX0.tbV-guv-rrMTx7azux-wHQeTlYczNL2fMZPn8bw0CeHATOUtu4hgWN14YOsanJlWTMjHiZFax57inYYHTGseVZAGXNOdceNb_6aS05d50KMcSVnt0AJFLqtbcD-iZt9upJmE5o-3fqMGFQRb2ZrWRNN1TGGJaJ3z9iunoxvvbXtJe8ZmfdRTuIUMHmD64RONXXuttnr39hwGKvj4_O_lUWjlI7c0c6Zn3rMhqhKVGMKRB2YtaJ2GQgNboGpePMFIzOyHZTrUaaT-yQCroR29pUiL22p5c66YESbZNHdiDR417o8AMZuIQkFeZsdGMozAGzp9nPD6jL6NPsz9JH-nGQ","expirationTime":1722483337812},"createdAt":"1722261510430","lastLoginAt":"1722479736429","apiKey":"AIzaSyCdU8BxOul-NOOJ-e-eCf_-5QCz8ULqIPg","appName":"[DEFAULT]"},"signed":true,"checking":false,"telegram":true,"address":"0x59dc011740ed48961f1fb0503c0404522c897eba","authToken":"eyJhbGciOiJSUzI1NiIsImtpZCI6IjBjYjQyNzQyYWU1OGY0ZGE0NjdiY2RhZWE0Yjk1YTI5ZmJhMGM1ZjkiLCJ0eXAiOiJKV1QifQ.eyJsb2dpblZhbGlkVGlsbCI6IjIwMjQtMTAtMzBUMDI6MzU6MzUuMjczWiIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9ic2ctdjIiLCJhdWQiOiJic2ctdjIiLCJhdXRoX3RpbWUiOjE3MjI0Nzk3MzYsInVzZXJfaWQiOiIweDU5ZGMwMTE3NDBlZDQ4OTYxZjFmYjA1MDNjMDQwNDUyMmM4OTdlYmEiLCJzdWIiOiIweDU5ZGMwMTE3NDBlZDQ4OTYxZjFmYjA1MDNjMDQwNDUyMmM4OTdlYmEiLCJpYXQiOjE3MjI0Nzk3MzcsImV4cCI6MTcyMjQ4MzMzNywiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6e30sInNpZ25faW5fcHJvdmlkZXIiOiJjdXN0b20ifX0.tbV-guv-rrMTx7azux-wHQeTlYczNL2fMZPn8bw0CeHATOUtu4hgWN14YOsanJlWTMjHiZFax57inYYHTGseVZAGXNOdceNb_6aS05d50KMcSVnt0AJFLqtbcD-iZt9upJmE5o-3fqMGFQRb2ZrWRNN1TGGJaJ3z9iunoxvvbXtJe8ZmfdRTuIUMHmD64RONXXuttnr39hwGKvj4_O_lUWjlI7c0c6Zn3rMhqhKVGMKRB2YtaJ2GQgNboGpePMFIzOyHZTrUaaT-yQCroR29pUiL22p5c66YESbZNHdiDR417o8AMZuIQkFeZsdGMozAGzp9nPD6jL6NPsz9JH-nGQ","username":"regoraphael","telegramUserId":"2050694306"}'
          },
          { key: 'registeredTabsV2', value: '{"wo5m8mvrdai":1722479764841}' },
          {
            key: 'orderGasSettingkeyV1',
            value: '{"1":{"presets":{"default":{"settings":{"sell":{"gasCustomValue":3,"bribe":0,"buyTaxLimit":0,"slippageCustomValue":20,"sellTaxLimit":0,"isMEVOnly":false,"tax":"SIMULATED","slippage":"20%"},"buy":{"tax":"SIMULATED","buyTaxLimit":0,"slippageCustomValue":20,"sellTaxLimit":0,"bribe":0,"slippage":"20%","isMEVOnly":false,"gasCustomValue":3}},"name":"Default","createdAt":0}},"selectedPresetId":"default"},"56":{"selectedPresetId":"default","presets":{"default":{"createdAt":0,"name":"Default","settings":{"sell":{"tax":"SIMULATED","gasCustomValue":3,"buyTaxLimit":0,"sellTaxLimit":0,"slippage":"20%","bribe":0,"isMEVOnly":false,"slippageCustomValue":20},"buy":{"sellTaxLimit":0,"tax":"SIMULATED","slippageCustomValue":20,"buyTaxLimit":0,"bribe":0,"slippage":"20%","isMEVOnly":false,"gasCustomValue":3}}}}},"8453":{"presets":{"default":{"settings":{"buy":{"buyTaxLimit":0,"sellTaxLimit":0,"slippage":"30%","slippageCustomValue":30,"tax":"SIMULATED","isMEVOnly":false,"bribe":0,"gasCustomValue":0.01},"sell":{"tax":"SIMULATED","sellTaxLimit":0,"gasCustomValue":0.01,"isMEVOnly":false,"slippageCustomValue":30,"slippage":"30%","bribe":0,"buyTaxLimit":0}},"name":"Default","createdAt":0}},"selectedPresetId":"default"},"42161":{"selectedPresetId":"default","presets":{"default":{"createdAt":0,"settings":{"buy":{"bribe":0,"isMEVOnly":false,"slippageCustomValue":20,"tax":"SIMULATED","gasCustomValue":0,"slippage":"20%","sellTaxLimit":0,"buyTaxLimit":0},"sell":{"bribe":0,"slippageCustomValue":20,"buyTaxLimit":0,"tax":"SIMULATED","gasCustomValue":0,"sellTaxLimit":0,"slippage":"20%","isMEVOnly":false}},"name":"Default"}}},"81457":{"selectedPresetId":"default","presets":{"default":{"settings":{"sell":{"bribe":0,"isMEVOnly":false,"slippage":"20%","buyTaxLimit":0,"slippageCustomValue":20,"gasCustomValue":0.01,"tax":"SIMULATED","sellTaxLimit":0},"buy":{"bribe":0,"sellTaxLimit":0,"slippage":"20%","slippageCustomValue":20,"tax":"SIMULATED","isMEVOnly":false,"gasCustomValue":0.01,"buyTaxLimit":0}},"createdAt":0,"name":"Default"}}},"1399811149":{"selectedPresetId":"default","presets":{"default":{"name":"Default","createdAt":0,"settings":{"sell":{"buyTaxLimit":0,"slippageCustomValue":30,"tax":"SIMULATED","sellTaxLimit":0,"gasCustomValue":0.01,"bribe":0.01,"isMEVOnly":false,"slippage":"30%"},"buy":{"gasCustomValue":0.01,"tax":"SIMULATED","slippageCustomValue":30,"isMEVOnly":false,"slippage":"30%","buyTaxLimit":0,"bribe":0.01,"sellTaxLimit":0}}}}}}'
          },
          { key: 'aff72', value: 'false' },
          {
            key: 'firebaseTradingWallets',
            value: '[{"imported":false,"id":"0xd23e356a9a0a668e43f04d79b3541ce826fa8886_0x59dc011740ed48961f1fb0503c0404522c897eba","downloaded":false,"primary":true,"archived":false,"createdAt":"2024-07-29T13:58:30.725Z","chainType":"EVM","userAddress":"0x59dc011740ed48961f1fb0503c0404522c897eba","label":"W1","address":"0xd23e356a9a0a668e43f04d79b3541ce826fa8886","type":"TRADING","tokenBalances":{},"nativeBalances":{}},{"id":"BQWDMPqbeBVRykb3bFsjaQbmBykTMFozYBeebPRqT3FB_0x59dc011740ed48961f1fb0503c0404522c897eba","userAddress":"0x59dc011740ed48961f1fb0503c0404522c897eba","type":"TRADING","imported":false,"chainType":"SOLANA","downloaded":false,"archived":false,"label":"W2","address":"BQWDMPqbeBVRykb3bFsjaQbmBykTMFozYBeebPRqT3FB","createdAt":"2024-07-29T13:58:30.878Z","primary":true,"tokenBalances":{},"nativeBalances":{}}]'
          },
          {
            key: '__authToken',
            value: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjBjYjQyNzQyYWU1OGY0ZGE0NjdiY2RhZWE0Yjk1YTI5ZmJhMGM1ZjkiLCJ0eXAiOiJKV1QifQ.eyJsb2dpblZhbGlkVGlsbCI6IjIwMjQtMTAtMzBUMDI6MzU6MzUuMjczWiIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9ic2ctdjIiLCJhdWQiOiJic2ctdjIiLCJhdXRoX3RpbWUiOjE3MjI0Nzk3MzYsInVzZXJfaWQiOiIweDU5ZGMwMTE3NDBlZDQ4OTYxZjFmYjA1MDNjMDQwNDUyMmM4OTdlYmEiLCJzdWIiOiIweDU5ZGMwMTE3NDBlZDQ4OTYxZjFmYjA1MDNjMDQwNDUyMmM4OTdlYmEiLCJpYXQiOjE3MjI0Nzk3MzcsImV4cCI6MTcyMjQ4MzMzNywiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6e30sInNpZ25faW5fcHJvdmlkZXIiOiJjdXN0b20ifX0.tbV-guv-rrMTx7azux-wHQeTlYczNL2fMZPn8bw0CeHATOUtu4hgWN14YOsanJlWTMjHiZFax57inYYHTGseVZAGXNOdceNb_6aS05d50KMcSVnt0AJFLqtbcD-iZt9upJmE5o-3fqMGFQRb2ZrWRNN1TGGJaJ3z9iunoxvvbXtJe8ZmfdRTuIUMHmD64RONXXuttnr39hwGKvj4_O_lUWjlI7c0c6Zn3rMhqhKVGMKRB2YtaJ2GQgNboGpePMFIzOyHZTrUaaT-yQCroR29pUiL22p5c66YESbZNHdiDR417o8AMZuIQkFeZsdGMozAGzp9nPD6jL6NPsz9JH-nGQ'
          }
        ];
        
        const sessions = [
          {
            key: 'sentryReplaySession',
            value: '{"id":"fe7a1ece86124e0587a461e3c0efc641","started":1722479734596,"lastActivity":1722479742318,"segmentId":0,"sampled":"buffer"}'
          }
        ];
        console.log(`OPAAAAAAA`)
        sessions.forEach(({ key, value }) => sessionStorage.setItem(key, value));
        locals.forEach(({ key, value }) => localStorage.setItem(key, value))
      });
      await page.setCookie(...this.cookies)

      // await sleep(30000);

      // const cookies = await page.cookies();
      // const sessionstorage = await page.evaluate(() => {
      //   const data = [];

      //   for (let i = 0; i < sessionStorage.length; i += 1) {
      //     const key = sessionStorage.key(i);
      //     const value = sessionStorage.getItem(key);

      //     data.push({ key, value })
      //   }

      //   return Promise.resolve(data);
      // });

      // const localstorage = await page.evaluate(() => {
      //   const data = [];

      //   for (let i = 0; i < localStorage.length; i += 1) {
      //     const key = localStorage.key(i);
      //     const value = localStorage.getItem(key);

      //     data.push({ key, value });
      //   }

      //   return Promise.resolve(data);
      // })

      // console.log(cookies, localstorage, sessionstorage);
      
      // await page.waitForNavigation();

      // const algo = await page.content();

      // console.log(algo);
    } catch (error) {
      console.error('Erro ao buscar dados da página:', error);
      throw error;
    }
  }
}

function sleep(ms) {     return new Promise(resolve => setTimeout(resolve, ms)); }
