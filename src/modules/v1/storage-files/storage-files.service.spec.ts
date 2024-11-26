import { Test, TestingModule } from '@nestjs/testing';
import { StorageFilesService } from './storage-files.service';

describe('StorageFilesService', () => {
  let service: StorageFilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageFilesService],
    }).compile();

    service = module.get<StorageFilesService>(StorageFilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
