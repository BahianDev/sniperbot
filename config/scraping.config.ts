import 'dotenv/config';
import { env } from 'process';

const { BULLX_URL } = env;

export const ScrapingConfig = {
  BULLX_URL,
};
