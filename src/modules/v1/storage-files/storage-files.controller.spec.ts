import { Test, TestingModule } from '@nestjs/testing';
import { StorageFilesController } from './storage-files.controller';
import { StorageFilesService } from './storage-files.service';

describe('StorageFilesController', () => {
  let controller: StorageFilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageFilesController],
      providers: [StorageFilesService],
    }).compile();

    controller = module.get<StorageFilesController>(StorageFilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
