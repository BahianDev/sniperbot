import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  createUser = this.prisma.user.create;

  getAlluUsers = this.prisma.user.findMany;

  getUserById = this.prisma.user.findUnique;

  updateUser = this.prisma.user.update;

  deleteUser = this.prisma.user.delete;
}
