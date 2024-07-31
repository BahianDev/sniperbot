import { Injectable, Logger } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramService {
  private bot: TelegramBot;
  private readonly logger = new Logger(TelegramService.name);

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is not defined');
    }

    // Inicializa o bot do Telegram
    this.bot = new TelegramBot(token, { polling: true });

    // Configura os handlers para mensagens recebidas
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(chatId, 'Welcome!');
    });

    this.bot.onText(/\/echo (.+)/, (msg, match) => {
      const chatId = msg.chat.id;
      const resp = match[1];
      this.bot.sendMessage(chatId, resp);
    });

    this.logger.log('Telegram bot initialized');
  }

  // Método para enviar mensagens a um chat específico
  sendMessage(chatId: number, text: string): Promise<void> {
    return this.bot.sendMessage(chatId, text);
  }
}
