import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { WhatsappService } from './whatsapp.service';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class WhatsappProvider implements OnModuleInit {
  private whatsappClient: Promise<Client>;

  constructor() {
    this.whatsappClient = this.createClient();
  }

  async onModuleInit() {
    await this.whatsappClient;
  }

  private async createClient() {
    const client = new Client({
      authStrategy: new LocalAuth({
        dataPath: '/tmp/whatsapp',
      }),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    client.on('qr', async (qr) => {
      qrcode.generate(qr, { small: true });
    });

    await client.initialize();

    return client;
  }

  async getWhatsappService(): Promise<WhatsappService> {
    return new WhatsappService(await this.whatsappClient);
  }
}
