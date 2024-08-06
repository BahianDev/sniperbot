import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

@Module({
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
  imports: [PrismaModule],
})
export class UsersModule {}
