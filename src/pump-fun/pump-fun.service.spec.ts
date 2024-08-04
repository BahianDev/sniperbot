import { Test, TestingModule } from '@nestjs/testing';
import { PumpFunService } from './pump-fun.service';

describe('PumpFunService', () => {
  let service: PumpFunService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PumpFunService],
    }).compile();

    service = module.get<PumpFunService>(PumpFunService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
