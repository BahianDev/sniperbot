import { Injectable } from '@nestjs/common';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class ReferralService {
  private readonly commissionLevels = [0, 25, 5, 3, 2, 1];

  constructor(private readonly userRepository: UsersRepository) {}

  async distributeCommissions(userId: string, revenue: number): Promise<void> {
    let currentUser = userId;
    let level = 0;

    while (currentUser && level < this.commissionLevels.length) {
      const commission = (revenue * this.commissionLevels[level]) / 100;

      if (level > 0) {
        // Adiciona comissão ao usuário atual
        await this.userRepository.updateUser({
          where: { id: currentUser },
          data: { revenue: { increment: commission } },
        });

        console.log(
          `Level ${level}: ${currentUser} recebeu ${commission.toFixed(2)}`,
        );
      }

      // Move para o próximo referenciador
      const user = await this.userRepository.getUserById({
        where: { id: currentUser },
        select: { referredBy: true },
      });

      currentUser = user?.referredBy || null;
      level++;
    }
  }
}
