import { Module } from '@nestjs/common';
import { FiltersRepository } from './filters.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [FiltersRepository],
  exports: [FiltersRepository],
  imports: [PrismaModule]
})
export class FiltersModule {}
