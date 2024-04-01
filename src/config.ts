import dotenv from 'dotenv';

dotenv.config();

class Config {
  public NODE_ENV: string | undefined;
  public CLIENT_URL: string | undefined;
  public EMAIL_SENDER: string | undefined;
  public RABBITMQ_ENDPOINT: string | undefined;
  public ELASTIC_SEARCH_URL: string | undefined;
  public EMAIL_SENDER_PASSWORD: string | undefined;
  public APP_ICON: string | undefined;

  constructor() {
    this.NODE_ENV = process.env.NODE_ENV || '';
    this.CLIENT_URL = process.env.CLIENT_URL || '';
    this.EMAIL_SENDER = process.env.EMAIL_SENDER || '';
    this.RABBITMQ_ENDPOINT = process.env.RABBITMQ_ENDPOINT || '';
    this.ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL || '';
    this.EMAIL_SENDER_PASSWORD = process.env.EMAIL_SENDER_PASSWORD || '';
    this.APP_ICON = process.env.APP_ICON || '';
  }
}

export const config: Config = new Config();