
import 'dotenv/config'
import { env } from 'process';

const { TELEGRAM_TOKEN } = env;

export const TelegramConfig = {
  TELEGRAM_TOKEN,
};
