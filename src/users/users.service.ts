import { Injectable, Logger } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import * as bs58 from 'bs58';

const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(telegramId: string) {
    const wallet = Keypair.generate();

    const user = await this.usersRepository.createUser({
      data: {
        telegramId,
        address: wallet.publicKey.toString(),
        pk: bs58.default.encode(wallet.secretKey),
      },
    });

    delete user.pk;

    return user;
  }

  async get(telegramId: string) {
    const user = await this.usersRepository.getUserById({
      where: {
        telegramId,
      },
    });

    return user;
  }

  async withdraw(telegramId: string, receiver: string) {
    const user = await this.usersRepository.getUserById({
      where: {
        telegramId,
      },
    });

    const secretKey = bs58.default.decode(user.pk);

    const keypair = Keypair.fromSecretKey(secretKey);

    const to = new PublicKey(receiver);

    const balance = await connection.getBalance(keypair.publicKey);

    const { feeCalculator } = await connection.getRecentBlockhash();
    const fee = feeCalculator.lamportsPerSignature;

    const amountToSend = balance - fee;

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: to,
        lamports: amountToSend,
      }),
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [
      keypair,
    ]);

    return signature;
  }

  async balance(address: string) {
    const balance = await connection.getBalance(new PublicKey(address));

    return balance / LAMPORTS_PER_SOL;
  }

  async reset(telegramId: string) {
    const user = await this.usersRepository.getUserById({
      where: {
        telegramId,
      },
    });

    const wallet = Keypair.generate();

    return await this.usersRepository.updateUser({
      where: {
        telegramId: user.telegramId,
      },
      data: {
        address: wallet.publicKey.toString(),
        pk: bs58.default.encode(wallet.secretKey),
      },
    });
  }
}
