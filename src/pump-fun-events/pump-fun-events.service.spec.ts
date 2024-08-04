import { Test, TestingModule } from '@nestjs/testing';
import { PumpFunEventsService } from './pump-fun-events.service';

describe('PumpFunEventsService', () => {
  let service: PumpFunEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PumpFunEventsService],
    }).compile();

    service = module.get<PumpFunEventsService>(PumpFunEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
