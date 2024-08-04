import { Injectable, Logger } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { TelegramConfig } from '../../config'
import { CoinsRepository } from 'src/coins/coins.repository';
import * as moment from 'moment';
import { FiltersRepository } from 'src/filters/filters.repository';
import { bufferCount } from 'rxjs';

@Injectable()
export class TelegramService {
  private bot: TelegramBot;
  private config: typeof TelegramConfig; 
  private readonly logger = new Logger(TelegramService.name);
  private addingPriceFilter = {};
  private addingMarketCapFilter = {};
  private addingCreationDateFilter = {};

  constructor(
    private readonly coinRepo: CoinsRepository,
    private readonly filterRepo: FiltersRepository,
  ) {
    this.config = TelegramConfig;
    const token = this.config.TELEGRAM_TOKEN;

    if (!token) {
      throw new Error('TELEGRAM_TOKEN is not defined');
    }

    // Inicializa o bot do Telegram
    this.bot = new TelegramBot(token, { polling: true });

    // Configura os handlers para mensagens recebidas
    this.bot.onText(/\/start/, (msg, match, ...more) => {
      this.logger.debug(match, more)
      const chatId = msg.chat.id;
      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'List Recently Created Coins', callback_data: '/coins/list_recently_created' },
            ],
            [
              { text: 'Sniper', callback_data: '/coins/sniper' },
            ],
          ],
        },
      };
      this.bot.sendMessage(
        chatId,
        `Welcome to SniperBot\nChoose a option.`,
        options,
      );
    });

    this.bot.on('callback_query', async (callbackQuery) => {
      const message = callbackQuery.message;
      const optionSelected = callbackQuery.data;

      if (optionSelected === '/coin/trade' || optionSelected === '/coin/create_alerts') {
        await this.bot.sendMessage(message.chat.id, `This functionality will be implemented soon.`);
        await this.bot.sendMessage(message.chat.id, `Type /start to return to the main menu`);
        return;
      }

      if (optionSelected === '/coins/list_recently_created') {
        const coins = await this.coinRepo.getAllCoins({ orderBy: { created_timestamp: 'desc' }, take: 15 });

        coins.forEach((coin) => {
          const text = `Name: ${coin.name},\nSymbol: ${coin.symbol},\nDescription: ${coin.description},\nMarketcap: US$ ${coin.usd_market_cap.toFixed(2)},\nPrice: ${coin.last_candlestick?.close.toFixed(15)},\nCreated at: ${moment(coin.created_timestamp).fromNow()}`
          const options = {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: `View '${coin.name}' on Pump.fun`, url: `https://pump.fun/${coin.mint}` },
                ],
                [
                  { text: `Trade '${coin.name}' (Coming soon)`, callback_data: '/coin/trade' },
                ],
                [
                  { text: `Create alerts about '${coin.name}' (Coming soon)`, callback_data: '/coin/create_alerts'},
                ]
              ],
            },
          };
  
          this.bot.sendMessage(message.chat.id, text, options);
        });

      }

      if (optionSelected === '/coins/sniper') {
        const activeFilters = await this.filterRepo.getAllFilters({
          where: {
            chatId: message.chat.id,
          }
        })

        if (!activeFilters?.length) {
          const text = `You must have at least one filter active to snipe tokens.\nPlease add a filter or type /start to return to the main menu`;
          const options = {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: `Add a filter`, callback_data: '/coins/add_filter' },
                ],
              ],
            },
          };

          this.bot.sendMessage(message.chat.id, text, options);
          return;
        }
        await this.bot.sendMessage(message.chat.id, 'Active Filters');
        
        await Promise.all(activeFilters.map((filter) => this.bot.sendMessage(message.chat.id, `${filter.label} - Min:  ${filter.min} - Max: ${filter.max}`)))
        let where = {}

        const priceFilter = activeFilters.find((filter) => filter.label === 'price');

        if (priceFilter) {

          if (priceFilter.max) {
            where['lte'] = new Number(priceFilter.max);
          }

          if (priceFilter.min) {
            where['gte'] = new Number(priceFilter.min).valueOf();
          }
        }


        const coins = await this.coinRepo.getAllCoins({
          where: {
            last_candlestick: { is: { close: where }  },
          },
          include: { last_candlestick: true },
          take: 5,
          orderBy: { created_timestamp: 'desc' }
        });

        const promises = coins?.map((coin) => {
          const text = `Name: ${coin.name},\nSymbol: ${coin.symbol},\nDescription: ${coin.description},\nMarketcap: US$ ${coin.usd_market_cap?.toFixed(2)},\nPrice: ${coin.last_candlestick?.close?.toFixed(15)},\nCreated at: ${moment(coin.created_timestamp).fromNow()}`
          const options = {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: `View '${coin.name}' on Pump.fun`, url: `https://pump.fun/${coin.mint}` },
                ],
                [
                  { text: `Trade '${coin.name}' (Coming soon)`, callback_data: '/coin/trade' },
                ],
                [
                  { text: `Create alerts about '${coin.name}' (Coming soon)`, callback_data: '/coin/create_alerts'},
                ]
              ],
            },
          };
  
          return this.bot.sendMessage(message.chat.id, text, options);
        });

        await Promise.all(promises);

        const options = {
          reply_markup: {
            inline_keyboard: [
              [
                { text: `Clear filters`, callback_data: '/coins/clear_filters' },
              ],
              [
                { text: `Refresh Snipe`, callback_data: '/coins/snipe' },
              ],
            ],
          },
        };

        this.bot.sendMessage(message.chat.id, 'Choose:', options);
      }

      if (optionSelected === '/coins/clear_filters') {
        const chatId = message.chat.id;

        await this.filterRepo.deleteMany({
          where: { chatId }
        });

        const text = 'The filters have been successfully removed';

        this.bot.sendMessage(
          chatId,
          text,
        );

        const options = {
          reply_markup: {
            inline_keyboard: [
              [
                { text: 'List Recently Created Coins', callback_data: '/coins/list_recently_created' },
              ],
              [
                { text: 'Sniper', callback_data: '/coins/sniper' },
              ],
            ],
          },
        };
        this.bot.sendMessage(
          chatId,
          `Welcome to SniperBot\nChoose a option.`,
          options,
        );
      }

      if(optionSelected.includes('/coins/add_filter')) {
        if (optionSelected === '/coins/add_filter') {
          const text = 'Select the filter you want to add:';

          const options = {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: `Price`, callback_data: '/coins/add_filter/price' },
                  { text: `MarketCap`, callback_data: '/coins/add_filter/marketcap' },
                ],
                [
                  { text: `Creation Date`, callback_data: '/coins/add_filter/creation_date' },
                ]
              ],
            },
          };

          this.bot.sendMessage(message.chat.id, text, options);
        }

        if (optionSelected.includes('/coins/add_filter/price')) {
          if(optionSelected === '/coins/add_filter/price') {
            const editindFilter = this.addingPriceFilter[message.chat.id];
            const haveMinFilter = editindFilter?.min === 0 || editindFilter?.min;
            const haveMaxFilter = editindFilter?.max === 0 || !!editindFilter?.max
            if (haveMaxFilter || haveMinFilter) {
              let text = '';
              let button;

              if (haveMaxFilter) {
                text += 'You have already set the maximum value for the price filter.\n';
                if(!haveMinFilter) {
                  button = { text: `Set Min`, callback_data: 'coins/coin/add_filter/price/set_min' };
                }
              }

              if (haveMinFilter) {
                text += 'You have already set the minimum value for the price filter.';
                if(!haveMaxFilter) {
                  button = { text: `Set Max`, callback_data: 'coins/coin/add_filter/price/set_max' };
                }
              }

              const options = {
                reply_markup: {
                  inline_keyboard: [
                    [
                      button ? button : undefined,
                      { text: `Activate Price Filter`, callback_data: '/coins/filter/price/activate' },
                    ],
                  ],
                },
              };

              this.bot.sendMessage(message.chat.id, text, options);
              return;
            }
            this.addingPriceFilter[message.chat.id] = { min: null, max: null, selectMin: false, selectMax: false };

            const text = 'Please set a minimum or maximum value for the price filter';

            const options = {
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: `Set Min`, callback_data: '/coins/add_filter/price/set_min' },
                    { text: `Set Max`, callback_data: '/coins/add_filter/price/set_max' },
                  ],
                ],
              },
            };

            this.bot.sendMessage(message.chat.id, text, options);
            return;
          }

          if (optionSelected === "/coins/add_filter/price/active") {
            const chatId = message.chat.id;
            const priceFilter = this.addingPriceFilter[chatId];

            await this.filterRepo.createFilter({ data: {
              chatId,
              active: true,
              label: 'price',
              max: priceFilter.max,
              min: priceFilter.min
            } });

            const text = 'Price filter successfully activated';

            const options = {
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: `Sniper Coins`, callback_data: '/coins/sniper' },
                  ],
                ],
              },
            };

            this.bot.sendMessage(chatId, text, options);
          }

          if(optionSelected === '/coins/add_filter/price/set_min') {
            this.addingPriceFilter[message.chat.id].selectMax = false;
            this.addingPriceFilter[message.chat.id].selectMin = true;

            const text = 'Enter the minimum value for the price filter';

            this.bot.sendMessage(message.chat.id, text);
            return;
          }

          if(optionSelected === '/coins/add_filter/price/set_max') {
            this.addingPriceFilter[message.chat.id].selectMax = true;
            this.addingPriceFilter[message.chat.id].selectMin = false;

            const text = 'Enter the maximum value for the price filter';

            this.bot.sendMessage(message.chat.id, text);
            return;
          }
        }

        if (optionSelected.includes('coins/coin/add_filter/marketcap')) {
          if(optionSelected === 'coins/coin/add_filter/marketcap') {}
          if(optionSelected === 'coins/coin/add_filter/marketcap/set_min') {}
          if(optionSelected === 'coins/coin/add_filter/marketcap/set_max') {}
        }

        if (optionSelected.includes('coins/coin/add_filter/creation_date')) {
          if(optionSelected === 'coins/coin/add_filter/creation_date') {}
          if(optionSelected === 'coins/coin/add_filter/creation_date/set_min') {}
          if(optionSelected === 'coins/coin/add_filter/creation_date/set_max') {}
        }
        return;
      }

    });

    this.bot.on('message', (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;

      const isNumeric = /^\d+(\.\d+)?$/.test(text);

      if (isNumeric) {
        const priceFilter = this.addingPriceFilter[chatId];
        const inputNumber = Number.parseFloat(text);
        if (priceFilter) {
          const {selectMin, selectMax } = priceFilter;
          
          if(selectMin) {
            this.addingPriceFilter[chatId].min = inputNumber;
            this.addingPriceFilter[chatId].selectMin = false;
            const alreadyMax = this.addingPriceFilter[chatId].max === 0 || this.addingPriceFilter[chatId].max
            const text = 'Minimum price filter value set successfully';

            const inline_keyboard = [];

            if (alreadyMax) inline_keyboard.push({ text: `Set Max`, callback_data: '/coins/add_filter/price/set_max' });

            inline_keyboard.push({ text: `Active Price Filter`, callback_data: '/coins/add_filter/price/active' });
  
            const options = {
              reply_markup: {
                inline_keyboard: [inline_keyboard],
              },
            };
  
            this.bot.sendMessage(chatId, text, options);
            return;
          }
  
          if(selectMax) {
            if (inputNumber <= 0) {
              const text = 'The value typed in must not be less than or equal to zero';
              this.bot.sendMessage(chatId, text);
              return;
            }
  
            this.addingPriceFilter[chatId].max = inputNumber;
            this.addingPriceFilter[chatId].selectMax = false;
            const alreadyMin = this.addingPriceFilter[chatId].min === 0 || this.addingPriceFilter[chatId].min
            const text = 'Minimum price filter value set successfully';

            const inline_keyboard = [];

            if (alreadyMin) inline_keyboard.push({ text: `Set Min`, callback_data: '/coins/add_filter/price/set_min' });

            inline_keyboard.push({ text: `Active Price Filter`, callback_data: '/coins/add_filter/price/active' });
  
            const options = {
              reply_markup: {
                inline_keyboard: [inline_keyboard],
              },
            };
    
            this.bot.sendMessage(chatId, text, options);
            return;
          }
        }

        return;
      }
    });

    this.logger.log('Telegram bot initialized');
  }

  // Método para enviar mensagens a um chat específico
  sendMessage(chatId: number, text: string): Promise<void> {
    return this.bot.sendMessage(chatId, text);
  }
}
