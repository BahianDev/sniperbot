import { Injectable, Logger } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { TelegramConfig } from '../../config';
import { CoinsRepository } from 'src/coins/coins.repository';
import * as moment from 'moment';
import { FiltersRepository } from 'src/filters/filters.repository';
import { bufferCount } from 'rxjs';
import { UsersService } from 'src/users/users.service';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { PumpFunService } from 'src/pump-fun/pump-fun.service';

@Injectable()
export class TelegramService {
  private bot: TelegramBot;
  private config: typeof TelegramConfig;
  private readonly logger = new Logger(TelegramService.name);
  private addingPriceFilter = {};
  private addingMarketCapFilter = {};
  private addingCreationDateFilter = {};
  private states = {};
  private tokenMetadata = [];

  constructor(
    private readonly coinRepo: CoinsRepository,
    private readonly filterRepo: FiltersRepository,
    private readonly usersService: UsersService,
    private readonly pumpFunService: PumpFunService,
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
      this.logger.debug(match, more);
      const chatId = msg.chat.id;
      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'List Recently Created Coins',
                callback_data: '/coins/list_recently_created',
              },
            ],
            [{ text: 'Sniper', callback_data: '/coins/sniper' }],
            [{ text: 'Wallet', callback_data: '/wallet' }],
            [{ text: 'Token', callback_data: '/token' }],
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
      const from = String(callbackQuery.message.chat.id);
      this.states[from] = { step: '' };

      if (
        optionSelected === '/coin/trade' ||
        optionSelected === '/coin/create_alerts'
      ) {
        await this.bot.sendMessage(
          message.chat.id,
          `This functionality will be implemented soon.`,
        );
        await this.bot.sendMessage(
          message.chat.id,
          `Type /start to return to the main menu`,
        );
        return;
      }

      if (optionSelected === '/wallet') {
        this.states[from] = { step: '' };

        let wallet;
        const userExist = await this.usersService.get(from);

        if (!userExist) {
          const user = await this.usersService.create(from);
          wallet = user.address;
        } else {
          wallet = userExist.address;
        }

        const balance = await this.usersService.balance(wallet);
        const options = {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'View on Solscan',
                  url: `https://solscan.io/account/${wallet}`,
                },
                // { text: 'Close', callback_data: '/wallet/close' },
              ],
              [{ text: 'Deposit SOL', callback_data: '/wallet/deposit' }],
              [
                {
                  text: 'Withdraw all SOL',
                  callback_data: '/wallet/withdraw/all',
                },
                { text: 'Withdraw x SOL', callback_data: '/wallet/withdraw' },
              ],
              [
                { text: 'Reset Wallet', callback_data: '/wallet/reset' },
                { text: 'Export Private Key', callback_data: '/wallet/pk' },
              ],
              [{ text: 'Refresh', callback_data: '/wallet/refresh' }],
            ],
          },
        };

        const text = `Your Wallet:\n\nAddress: ${wallet}\n\nBalance: ${balance} SOL\n\nTap to copy the address and send SOL to deposit`;

        this.bot.sendMessage(message.chat.id, text, options);
      }

      if (optionSelected === '/wallet/deposit') {
        this.states[from] = { step: '' };

        const user = await this.usersService.get(from);

        const text = 'To deposit send SOL to below address:';
        this.bot.sendMessage(message.chat.id, text);
        this.bot.sendMessage(message.chat.id, user.address);
      }

      if (optionSelected === '/wallet/pk') {
        this.states[from] = { step: '' };

        const text =
          'Are you sure you want to export your Private Key?\n\n🚨 WARNING: Never share your private key! 🚨\nIf anyone, including SniperBot team or mods, is asking for your private key, IT IS A SCAM! Sending it to them will give them full control over your wallet.\n\nSniperBot team and mods will NEVER ask for your private key.';
        const options = {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'I Will Not Share My Private Key, Confirm',
                  callback_data: '/wallet/pk/confirm',
                },
              ],
              [{ text: 'Cancel', callback_data: '/wallet/pk/cancel' }],
            ],
          },
        };
        this.bot.sendMessage(message.chat.id, text, options);
      }

      if (optionSelected === '/wallet/pk/confirm') {
        this.states[from] = { step: '' };

        const user = await this.usersService.get(from);

        const text = `Your Private Key is:\n\n${user.pk}\n\nYou can now e.g. import the key into a wallet like Solflare (tap to copy)\nThis message should auto-delete in 1 minute. If not, delete this message once you are done.`;

        const { message_id } = await this.bot.sendMessage(
          message.chat.id,
          text,
        );

        setTimeout(() => {
          this.bot.deleteMessage(message.chat.id, message_id).catch((error) => {
            console.error('Erro ao deletar a mensagem:', error);
          });
        }, 60000);
      }

      if (optionSelected === '/wallet/reset') {
        this.states[from] = { step: '' };

        const user = await this.usersService.get(from);

        const balance = await this.usersService.balance(user.address);

        const text = `Are you sure you want to reset your SniperBot Wallet?\n\nWARNING: This action is irreversible!\n\SniperBot will generate a new wallet for you and discard your old one.\n\nYou have ${balance} SOL in your wallet. If you don't withdraw or back up the private key it will get lost.`;
        const options = {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Cancel',
                  callback_data: '/wallet/reset/cancel',
                },
                { text: 'Confirm', callback_data: '/wallet/reset/confirm' },
              ],
            ],
          },
        };
        await this.bot.sendMessage(message.chat.id, text, options);
      }

      if (optionSelected === '/wallet/reset/confirm') {
        this.states[from] = { step: '' };
        const text = `CONFIRM: Are you sure you want to reset your SniperBot Wallet?\n\nWARNING: This action is irreversible!`;
        const options = {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Cancel',
                  callback_data: '/wallet/reset/cancel',
                },
                {
                  text: 'Confirm',
                  callback_data: '/wallet/reset/confirm/confirm',
                },
              ],
            ],
          },
        };
        await this.bot.sendMessage(message.chat.id, text, options);
      }

      if (optionSelected === '/wallet/reset/confirm/confirm') {
        this.states[from] = { step: '' };
        const user = await this.usersService.get(from);
        const newUser = await this.usersService.reset(from);

        const text1 = `Your Private Key for your OLD wallet is:\n\n${user.pk}\n\nYou can now e.g. import the key into a wallet like Solflare (tap to copy)\nSave this key in case you need to access this wallet again.`;
        const text2 = `Success: Your new wallet is:\n\n${newUser.address}\n\nYou can now send SOL to this address to deposit into your new wallet. Press refresh to see your new wallet.`;
        await this.bot.sendMessage(message.chat.id, text1);
        await this.bot.sendMessage(message.chat.id, text2);
      }

      if (optionSelected === '/wallet/withdraw/all') {
        const text = 'Reply with the destination address';
        this.states[from] = { step: 'awaitingAddress' };
        await this.bot.sendMessage(message.chat.id, text);
      }

      if (optionSelected === '/token') {
        const options = {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Create Token',
                  callback_data: `/token/create`,
                },
              ],
              [{ text: 'View Tokens', callback_data: '/token/view' }],
            ],
          },
        };

        this.bot.sendMessage(message.chat.id, 'Token Manager', options);
      }

      if (optionSelected === '/token/create') {
        const text = 'Please type the name of the token:';
        this.states[from] = { step: 'await/name' };

        this.bot.sendMessage(message.chat.id, text);
      }

      if (optionSelected === '/coins/list_recently_created') {
        const coins = await this.coinRepo.getAllCoins({
          orderBy: { created_timestamp: 'desc' },
          take: 15,
        });

        coins.forEach((coin) => {
          const text = `Name: ${coin.name},\nSymbol: ${
            coin.symbol
          },\nDescription: ${
            coin.description
          },\nMarketcap: US$ ${coin.usd_market_cap.toFixed(
            2,
          )},\nPrice: ${coin.last_candlestick?.close.toFixed(
            15,
          )},\nCreated at: ${moment(coin.created_timestamp).fromNow()}`;
          const options = {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `View '${coin.name}' on Pump.fun`,
                    url: `https://pump.fun/${coin.mint}`,
                  },
                ],
                [
                  {
                    text: `Trade '${coin.name}' (Coming soon)`,
                    callback_data: '/coin/trade',
                  },
                ],
                [
                  {
                    text: `Create alerts about '${coin.name}' (Coming soon)`,
                    callback_data: '/coin/create_alerts',
                  },
                ],
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
          },
        });

        if (!activeFilters?.length) {
          const text = `You must have at least one filter active to snipe tokens.\nPlease add a filter or type /start to return to the main menu`;
          const options = {
            reply_markup: {
              inline_keyboard: [
                [{ text: `Add a filter`, callback_data: '/coins/add_filter' }],
              ],
            },
          };

          this.bot.sendMessage(message.chat.id, text, options);
          return;
        }
        await this.bot.sendMessage(message.chat.id, 'Active Filters');

        await Promise.all(
          activeFilters.map((filter) =>
            this.bot.sendMessage(
              message.chat.id,
              `${filter.label} - Min:  ${filter.min} - Max: ${filter.max}`,
            ),
          ),
        );
        let where = {};

        const priceFilter = activeFilters.find(
          (filter) => filter.label === 'price',
        );

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
            last_candlestick: { is: { close: where } },
          },
          include: { last_candlestick: true },
          take: 5,
          orderBy: { created_timestamp: 'desc' },
        });

        const promises = coins?.map((coin) => {
          const text = `Name: ${coin.name},\nSymbol: ${
            coin.symbol
          },\nDescription: ${
            coin.description
          },\nMarketcap: US$ ${coin.usd_market_cap?.toFixed(
            2,
          )},\nPrice: ${coin.last_candlestick?.close?.toFixed(
            15,
          )},\nCreated at: ${moment(coin.created_timestamp).fromNow()}`;
          const options = {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `View '${coin.name}' on Pump.fun`,
                    url: `https://pump.fun/${coin.mint}`,
                  },
                ],
                [
                  {
                    text: `Trade '${coin.name}' (Coming soon)`,
                    callback_data: '/coin/trade',
                  },
                ],
                [
                  {
                    text: `Create alerts about '${coin.name}' (Coming soon)`,
                    callback_data: '/coin/create_alerts',
                  },
                ],
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
                {
                  text: `Clear filters`,
                  callback_data: '/coins/clear_filters',
                },
              ],
              [{ text: `Refresh Snipe`, callback_data: '/coins/snipe' }],
            ],
          },
        };

        this.bot.sendMessage(message.chat.id, 'Choose:', options);
      }

      if (optionSelected === '/coins/clear_filters') {
        const chatId = message.chat.id;

        await this.filterRepo.deleteMany({
          where: { chatId },
        });

        const text = 'The filters have been successfully removed';

        this.bot.sendMessage(chatId, text);

        const options = {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'List Recently Created Coins',
                  callback_data: '/coins/list_recently_created',
                },
              ],
              [{ text: 'Sniper', callback_data: '/coins/sniper' }],
            ],
          },
        };
        this.bot.sendMessage(
          chatId,
          `Welcome to SniperBot\nChoose a option.`,
          options,
        );
      }

      if (optionSelected.includes('/coins/add_filter')) {
        if (optionSelected === '/coins/add_filter') {
          const text = 'Select the filter you want to add:';

          const options = {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: `Price`, callback_data: '/coins/add_filter/price' },
                  {
                    text: `MarketCap`,
                    callback_data: '/coins/add_filter/marketcap',
                  },
                ],
                [
                  {
                    text: `Creation Date`,
                    callback_data: '/coins/add_filter/creation_date',
                  },
                ],
              ],
            },
          };

          this.bot.sendMessage(message.chat.id, text, options);
        }

        if (optionSelected.includes('/coins/add_filter/price')) {
          if (optionSelected === '/coins/add_filter/price') {
            const editindFilter = this.addingPriceFilter[message.chat.id];
            const haveMinFilter =
              editindFilter?.min === 0 || editindFilter?.min;
            const haveMaxFilter =
              editindFilter?.max === 0 || !!editindFilter?.max;
            if (haveMaxFilter || haveMinFilter) {
              let text = '';
              let button;

              if (haveMaxFilter) {
                text +=
                  'You have already set the maximum value for the price filter.\n';
                if (!haveMinFilter) {
                  button = {
                    text: `Set Min`,
                    callback_data: 'coins/coin/add_filter/price/set_min',
                  };
                }
              }

              if (haveMinFilter) {
                text +=
                  'You have already set the minimum value for the price filter.';
                if (!haveMaxFilter) {
                  button = {
                    text: `Set Max`,
                    callback_data: 'coins/coin/add_filter/price/set_max',
                  };
                }
              }

              const options = {
                reply_markup: {
                  inline_keyboard: [
                    [
                      button ? button : undefined,
                      {
                        text: `Activate Price Filter`,
                        callback_data: '/coins/filter/price/activate',
                      },
                    ],
                  ],
                },
              };

              this.bot.sendMessage(message.chat.id, text, options);
              return;
            }
            this.addingPriceFilter[message.chat.id] = {
              min: null,
              max: null,
              selectMin: false,
              selectMax: false,
            };

            const text =
              'Please set a minimum or maximum value for the price filter';

            const options = {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: `Set Min`,
                      callback_data: '/coins/add_filter/price/set_min',
                    },
                    {
                      text: `Set Max`,
                      callback_data: '/coins/add_filter/price/set_max',
                    },
                  ],
                ],
              },
            };

            this.bot.sendMessage(message.chat.id, text, options);
            return;
          }

          if (optionSelected === '/coins/add_filter/price/active') {
            const chatId = message.chat.id;
            const priceFilter = this.addingPriceFilter[chatId];

            await this.filterRepo.createFilter({
              data: {
                chatId,
                active: true,
                label: 'price',
                max: priceFilter.max,
                min: priceFilter.min,
              },
            });

            const text = 'Price filter successfully activated';

            const options = {
              reply_markup: {
                inline_keyboard: [
                  [{ text: `Sniper Coins`, callback_data: '/coins/sniper' }],
                ],
              },
            };

            this.bot.sendMessage(chatId, text, options);
          }

          if (optionSelected === '/coins/add_filter/price/set_min') {
            this.addingPriceFilter[message.chat.id].selectMax = false;
            this.addingPriceFilter[message.chat.id].selectMin = true;

            const text = 'Enter the minimum value for the price filter';

            this.bot.sendMessage(message.chat.id, text);
            return;
          }

          if (optionSelected === '/coins/add_filter/price/set_max') {
            this.addingPriceFilter[message.chat.id].selectMax = true;
            this.addingPriceFilter[message.chat.id].selectMin = false;

            const text = 'Enter the maximum value for the price filter';

            this.bot.sendMessage(message.chat.id, text);
            return;
          }
        }

        if (optionSelected.includes('coins/coin/add_filter/marketcap')) {
          if (optionSelected === 'coins/coin/add_filter/marketcap') {
          }
          if (optionSelected === 'coins/coin/add_filter/marketcap/set_min') {
          }
          if (optionSelected === 'coins/coin/add_filter/marketcap/set_max') {
          }
        }

        if (optionSelected.includes('coins/coin/add_filter/creation_date')) {
          if (optionSelected === 'coins/coin/add_filter/creation_date') {
          }
          if (
            optionSelected === 'coins/coin/add_filter/creation_date/set_min'
          ) {
          }
          if (
            optionSelected === 'coins/coin/add_filter/creation_date/set_max'
          ) {
          }
        }
        return;
      }
    });

    this.bot.on('message', async (msg) => {
      try {
        const chatId = msg.chat.id;
        const text = msg.text;
        const from = msg.from.id;

        const isNumeric = /^\d+(\.\d+)?$/.test(text);
        console.log(this.states[from].step);

        if (isNumeric) {
          const priceFilter = this.addingPriceFilter[chatId];
          const inputNumber = Number.parseFloat(text);
          if (priceFilter) {
            const { selectMin, selectMax } = priceFilter;

            if (selectMin) {
              this.addingPriceFilter[chatId].min = inputNumber;
              this.addingPriceFilter[chatId].selectMin = false;
              const alreadyMax =
                this.addingPriceFilter[chatId].max === 0 ||
                this.addingPriceFilter[chatId].max;
              const text = 'Minimum price filter value set successfully';

              const inline_keyboard = [];

              if (alreadyMax)
                inline_keyboard.push({
                  text: `Set Max`,
                  callback_data: '/coins/add_filter/price/set_max',
                });

              inline_keyboard.push({
                text: `Active Price Filter`,
                callback_data: '/coins/add_filter/price/active',
              });

              const options = {
                reply_markup: {
                  inline_keyboard: [inline_keyboard],
                },
              };

              this.bot.sendMessage(chatId, text, options);
              return;
            }

            if (selectMax) {
              if (inputNumber <= 0) {
                const text =
                  'The value typed in must not be less than or equal to zero';
                this.bot.sendMessage(chatId, text);
                return;
              }

              this.addingPriceFilter[chatId].max = inputNumber;
              this.addingPriceFilter[chatId].selectMax = false;
              const alreadyMin =
                this.addingPriceFilter[chatId].min === 0 ||
                this.addingPriceFilter[chatId].min;
              const text = 'Minimum price filter value set successfully';

              const inline_keyboard = [];

              if (alreadyMin)
                inline_keyboard.push({
                  text: `Set Min`,
                  callback_data: '/coins/add_filter/price/set_min',
                });

              inline_keyboard.push({
                text: `Active Price Filter`,
                callback_data: '/coins/add_filter/price/active',
              });

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

        if (this.states[from].step === 'await/name') {
          let name = text;

          this.tokenMetadata[from] = { name: name };
          this.bot.sendMessage(chatId, 'Type the token symbol');
          this.states[from] = { step: 'await/symbol' };
        } else if (this.states[from].step === 'await/symbol') {
          let symbol = text;

          const newObject = {
            ...this.tokenMetadata[from],
            symbol,
          };

          this.tokenMetadata[from] = newObject;
          this.bot.sendMessage(chatId, 'Type the token description');
          this.states[from] = { step: 'await/description' };
        } else if (this.states[from].step === 'await/description') {
          let description = text;

          const newObject = {
            ...this.tokenMetadata[from],
            description,
          };

          this.tokenMetadata[from] = newObject;
          this.bot.sendMessage(chatId, 'Type Twitter URL:');
          this.states[from] = { step: 'await/twitter' };
        } else if (this.states[from].step === 'await/twitter') {
          let twitter = text;
          const newObject = {
            ...this.tokenMetadata[from],
            twitter,
          };
          this.tokenMetadata[from] = newObject;
          this.bot.sendMessage(chatId, 'Type Telegram URL:');
          this.states[from] = { step: 'await/telegram' };
        } else if (this.states[from].step === 'await/telegram') {
          let telegram = text;
          const newObject = {
            ...this.tokenMetadata[from],
            telegram,
          };
          this.tokenMetadata[from] = newObject;
          this.bot.sendMessage(chatId, 'Type Website URL:');
          this.states[from] = { step: 'await/website' };
        } else if (this.states[from].step === 'await/website') {
          let website = text;
          const newObject = {
            ...this.tokenMetadata[from],
            website,
          };
          this.tokenMetadata[from] = newObject;
          this.bot.sendMessage(chatId, 'Send the logo image:');
          this.states[from] = { step: 'await/file' };
        } else if (this.states[from].step === 'await/file') {
          const photo = msg.photo[msg.photo.length - 1];
          const fileId = photo.file_id;

          const fileLink = await this.bot.getFileLink(fileId);
          const response = await axios.get(fileLink, {
            responseType: 'arraybuffer',
          });
          const fileBuffer = Buffer.from(response.data, 'binary');
          const fileBlob = new Blob([response.data], {
            type: response.headers['content-type'],
          });

          const user = await this.usersService.get(String(from));

          const newObject = {
            ...this.tokenMetadata[from],
            file: fileBlob,
            publickey: user.address,
            pk: user.pk,
          };
          this.tokenMetadata[from] = newObject;

          console.log(newObject);
          const textResponse = this.pumpFunService.createToken(
            this.tokenMetadata[from],
          );
          this.bot.sendMessage(chatId, `Token created successfully\n\n${textResponse}`);

        }

        if (this.states[from].step === 'awaitingAddress') {
          const user = await this.usersService.get(String(from));

          const balance = await this.usersService.balance(user.address);

          if (balance === 0) {
            const textResponse = `Not enough balance!`;
            this.bot.sendMessage(chatId, textResponse);
            this.states[from] = { step: 'awaitingAddress' };
          }

          const signature = await this.usersService.withdraw(
            String(from),
            text,
          );
          const textResponse = `Transaction sent successfully\n\n${signature}`;
          this.bot.sendMessage(chatId, textResponse);
        }
      } catch (error) {
        console.log(error);
      }
    });

    this.logger.log('Telegram bot initialized');
  }

  // Método para enviar mensagens a um chat específico
  sendMessage(chatId: number, text: string): Promise<void> {
    return this.bot.sendMessage(chatId, text);
  }
}
