import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FiltersRepository {
  constructor(private readonly prisma: PrismaService) {}

  createFilter = this.prisma.filters.create;

  getAllFilters = this.prisma.filters.findMany;

  getFilterById = this.prisma.filters.findUnique;

  updateFilter = this.prisma.filters.update;

  deleteFilter = this.prisma.filters.delete;

  deleteMany = this.prisma.filters.deleteMany;
}
