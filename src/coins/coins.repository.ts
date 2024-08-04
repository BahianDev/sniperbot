import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoinsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createCoin = this.prisma.coins.create;

  getAllCoins = this.prisma.coins.findMany;

  getCoinById = this.prisma.coins.findUnique;

  updateCoin = this.prisma.coins.update;

  deleteCoin = this.prisma.coins.delete;
}
