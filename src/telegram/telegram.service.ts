import { Injectable, Logger } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { TelegramConfig } from '../../config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TelegramService {
  private bot: TelegramBot;
  private config: typeof TelegramConfig;
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly usersService: UsersService) {
    this.config = TelegramConfig;
    const token = this.config.TELEGRAM_TOKEN;

    if (!token) {
      throw new Error('TELEGRAM_TOKEN is not defined');
    }

    this.bot = new TelegramBot(token, { polling: true });

    this.bot.onText(/\/start/, (msg, match, ...more) => {
      this.logger.debug(match, more);
      const chatId = msg.chat.id;
      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '💊 BumpBot', callback_data: '/' },
              {
                text: '💬 CommentBot',
                callback_data: '/',
              },
              { text: '💸 Volume Bot', callback_data: '/' },
            ],
            [
              { text: '🚀 DexRockets', callback_data: '/' },
              { text: '🏹 Sniper', callback_data: '/' },
              { text: '➕ Holdersboost', callback_data: '/' },
            ],
            [
              { text: '👛 Wallet', callback_data: '/wallet' },
              { text: '💰 Referrals', callback_data: '/referrals' },
            ],
            [
              { text: '📜 About', callback_data: '/' },
              { text: '🪂 Airdrop', callback_data: '/' },
              { text: '⟳ Refresh', callback_data: '/' },
            ],
          ],
        },
      };

      const walletAddress = 'DYKHTTEk1ygAWJCfY4CjmD2AP3nfHBJhuPzm2fP6p9g5';
      const walletLink =
        'https://solscan.io/account/DYKHTTEk1ygAWJCfY4CjmD2AP3nfHBJhuPzm2fP6p9g5';
      this.bot.sendPhoto(
        chatId,
        'https://cdn.discordapp.com/attachments/1288199885727727626/1306382947217309767/CENSORED_20241113_231902_0000.png?ex=6736776e&is=673525ee&hm=84d6a98725cdd2604d023d0a568d4095953d073b0ffa9cb3d60dd3e82b0af222&',
        {
          caption: `Welcome to TurboTurtle Bot, load up your main wallet below to start achieving:\n\n[${walletAddress}](${walletLink}) (Tap to copy)\nBalance: 0 SOL ($0.00)\n\nClick on the Refresh button to update your current balance.\n\nIf you need help with any feature, enter /help to learn more about all possibilities`,
          parse_mode: 'Markdown',
          ...options,
        },
      );
    });

    this.bot.on('callback_query', async (callbackQuery) => {
      const message = callbackQuery.message;
      const optionSelected = callbackQuery.data;
      const from = String(callbackQuery.message.chat.id);
      const telegramUserId = String(callbackQuery.message.from.id);

      const user = await this.usersService.get(telegramUserId);

      if (optionSelected === '/main_menu') {
        try {
          await this.bot.deleteMessage(
            message.chat.id,
            String(message.message_id),
          );
        } catch (error) {
          this.logger.error('Erro ao deletar mensagem:', error);
        }
      }

      if (optionSelected === '/wallet') {
        let wallet;
        const userExist = await this.usersService.get(telegramUserId);

        if (!userExist) {
          const user = await this.usersService.create(telegramUserId);
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
                  text: '✅ 12mK...3759',
                  url: `https://solscan.io/account/${wallet}`,
                },
                {
                  text: `${balance} SOL`,
                  callback_data: '/',
                },
                {
                  text: '👛 Normal',
                  callback_data: '/',
                },
              ],
              [
                {
                  text: '⏭️ Transfer SOL Sniper Wallets Into One',
                  callback_data: '/',
                },
              ],
              [
                {
                  text: '➕ Create New Wallet',
                  callback_data: '/',
                },
                { text: '⏬ Import Wallet', callback_data: '/' },
              ],
              [
                { text: '➕ Create 5 New Wallets', callback_data: '/' },
                { text: '🗑 Delete Wallet', callback_data: '/' },
              ],
              [
                { text: '◀ Main Menu', callback_data: '/main_menu' },
                { text: '❗ INFO', callback_data: '/' },
                { text: '⟳ Refresh', callback_data: '/' },
              ],
            ],
          },
        };

        const walletAddress = user.address;
        const walletLink = `https://solscan.io/account/${walletAddress}`;

        const text =
          `🐢👛 TurboTurtle's Wallet Overview - Manage your Wallets\n\n` +
          `Total Value (0) Wallets: 0.00 SOL\n\n` +
          `Selected Main Wallet: (Click to Copy Address)\n` +
          `[${walletAddress}](${walletLink})\n\n` +
          `💡 Click on a specific wallet to Deposit, Withdraw, Rename, Export, Delete, Disperse and change wallet-type (Main/Normal/Sniper)`;

        this.bot.sendMessage(message.chat.id, text, {
          parse_mode: 'Markdown',
          ...options,
        });
      }

      if (optionSelected === '/referrals') {
        const chatId = from;

        const options = {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: `🪂 Selected Rewards Wallet: 12mK...3759`,
                  callback_data: '/',
                },
              ],
              [
                {
                  text: '◀ Main Menu',
                  callback_data: '/main_menu',
                },
              ],
            ],
          },
        };

        const text =
          `💰🐢 TurboTurtle offers an attractive multi-level referral program where you can earn rewards from direct and indirect referrals. You'll receive 25% of all fees from your direct referrals, and additional percentages from indirect referrals.\n\n` +
          `This framework not only promotes community development but also substantially boosts the fee percentage for all participants.\n\n` +
          `--------- Your Referrals (updated every 15 min)\n` +
          `• Users referred: 9 (direct: 1, indirect: 8)\n` +
          `• Total rewards: 0.4714 SOL ($64.85)\n` +
          `• Total paid: 0.4688 SOL ($64.51)\n` +
          `• Total unpaid: 0.0025 SOL ($0.35)\n\n` +
          `You must have accrued at least 0.005 SOL in unpaid fees to be eligible for a payout.\n\n` +
          `--------- Your Unique Referral Link:\n` +
          `https://t.me/turboturtletg?start=r-username`;

        this.bot.sendPhoto(
          chatId,
          'https://cdn.discordapp.com/attachments/1200675085749596230/1322372632456466635/image.png?ex=6770a2fc&is=676f517c&hm=8db8a727451fb2a69e4a2ca67240d91cedc6f0abadefc855a495645c5def1178&',
          {
            caption: text,
            parse_mode: 'Markdown',
            ...options,
          },
        );
      }
    });

    this.bot.on('message', async (msg) => {
      try {
        const chatId = msg.chat.id;
        const text = msg.text;
        const from = msg.from.id;

      } catch (error) {
        console.log(error);
      }
    });

    this.logger.log('Telegram bot initialized');
  }

  sendMessage(chatId: number, text: string): Promise<void> {
    return this.bot.sendMessage(chatId, text);
  }
}
