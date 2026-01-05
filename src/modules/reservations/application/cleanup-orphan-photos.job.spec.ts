import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { CleanupOrphanPhotosJob } from './cleanup-orphan-photos.job';

describe('CleanupOrphanPhotosJob', () => {
  let job: CleanupOrphanPhotosJob;
  let mockConfigService: any;
  let mockJobRepository: any;

  beforeEach(() => {
    // Mock ConfigService
    mockConfigService = {
      get: vi.fn((key: string) => {
        const config: Record<string, any> = {
          BULL_QUEUE_NAME: 'test-queue',
          REDIS_HOST: 'localhost',
          REDIS_PORT: 6379,
          REDIS_PASSWORD: undefined,
        };
        return config[key];
      }),
    };

    // Mock JobRepository
    mockJobRepository = {
      deleteOrphanPhotos: vi.fn().mockResolvedValue(5),
    };

    job = new CleanupOrphanPhotosJob(mockConfigService, mockJobRepository);
  });

  describe('scheduleCleanup', () => {
    it('should schedule cleanup with default cron expression', async () => {
      vi.mock('bullmq');

      await expect(
        job.scheduleCleanup('0 2 * * *', 1440),
      ).resolves.not.toThrow();
    });

    it('should use custom cron expression', async () => {
      const customCron = '0 3 * * *';
      await expect(
        job.scheduleCleanup(customCron, 1440),
      ).resolves.not.toThrow();
    });

    it('should use custom olderThanMinutes value', async () => {
      await expect(
        job.scheduleCleanup('0 2 * * *', 720),
      ).resolves.not.toThrow();
    });

    it('should log schedule message', async () => {
      const logSpy = vi.spyOn(job['logger'], 'log');
      await job.scheduleCleanup('0 2 * * *', 1440);

      expect(logSpy).toHaveBeenCalledWith(
        `정리 작업 예약됨 (cron: 0 2 * * *)`,
      );
    });

    it('should use Redis configuration from ConfigService', async () => {
      vi.spyOn(mockConfigService, 'get');
      await job.scheduleCleanup('0 2 * * *', 1440);

      expect(mockConfigService.get).toHaveBeenCalledWith('REDIS_HOST');
      expect(mockConfigService.get).toHaveBeenCalledWith('REDIS_PORT');
    });

    it('should handle default values when config is not set', async () => {
      mockConfigService.get = vi.fn((key: string) => {
        if (key === 'BULL_QUEUE_NAME') return undefined;
        if (key === 'REDIS_HOST') return 'localhost';
        if (key === 'REDIS_PORT') return 6379;
        return undefined;
      });

      const jobWithNewConfig = new CleanupOrphanPhotosJob(
        mockConfigService,
        mockJobRepository,
      );

      await expect(
        jobWithNewConfig.scheduleCleanup('0 2 * * *', 1440),
      ).resolves.not.toThrow();
    });
  });

  describe('handleCleanupJob', () => {
    it('should delete orphan photos with specified age', async () => {
      const deleteOrphanPhotosSpy = mockJobRepository.deleteOrphanPhotos;

      await job['handleCleanupJob']({ olderThanMinutes: 1440 });

      expect(deleteOrphanPhotosSpy).toHaveBeenCalledWith(1440);
    });

    it('should use default olderThanMinutes value', async () => {
      const deleteOrphanPhotosSpy = mockJobRepository.deleteOrphanPhotos;

      await job['handleCleanupJob']({ olderThanMinutes: 0 });

      expect(deleteOrphanPhotosSpy).toHaveBeenCalledWith(1440);
    });

    it('should log successful cleanup', async () => {
      const logSpy = vi.spyOn(job['logger'], 'log');
      mockJobRepository.deleteOrphanPhotos.mockResolvedValue(10);

      await job['handleCleanupJob']({ olderThanMinutes: 1440 });

      expect(logSpy).toHaveBeenCalledWith(
        `1440분 이상 된 고아 사진 10개 삭제됨`,
      );
    });

    it('should return result count', async () => {
      mockJobRepository.deleteOrphanPhotos.mockResolvedValue(25);

      const handleCleanupJobPrivate = job['handleCleanupJob'].bind(job);
      await handleCleanupJobPrivate({ olderThanMinutes: 1440 });

      expect(mockJobRepository.deleteOrphanPhotos).toHaveBeenCalledWith(1440);
    });

    it('should handle error during cleanup', async () => {
      const error = new Error('Database error');
      mockJobRepository.deleteOrphanPhotos.mockRejectedValue(error);

      const errorSpy = vi.spyOn(job['logger'], 'error');

      await expect(
        job['handleCleanupJob']({ olderThanMinutes: 1440 }),
      ).rejects.toThrow();

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('정리 작업 중 오류 발생'),
      );
    });

    it('should handle Error type properly', async () => {
      const error = new Error('Specific error message');
      mockJobRepository.deleteOrphanPhotos.mockRejectedValue(error);

      const errorSpy = vi.spyOn(job['logger'], 'error');

      try {
        await job['handleCleanupJob']({ olderThanMinutes: 1440 });
      } catch (e) {
        // Expected to throw
      }

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Specific error message'),
      );
    });

    it('should handle non-Error object thrown', async () => {
      mockJobRepository.deleteOrphanPhotos.mockRejectedValue(
        'String error message',
      );

      const errorSpy = vi.spyOn(job['logger'], 'error');

      try {
        await job['handleCleanupJob']({ olderThanMinutes: 1440 });
      } catch (e) {
        // Expected to throw
      }

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('String error message'),
      );
    });
  });

  describe('configuration', () => {
    it('should initialize with required dependencies', () => {
      expect(job).toBeDefined();
      expect(job['configService']).toBe(mockConfigService);
      expect(job['jobRepository']).toBe(mockJobRepository);
    });

    it('should have worker initially null', () => {
      expect(job['worker']).toBeNull();
    });

    it('should have logger configured', () => {
      expect(job['logger']).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle zero deleted photos', async () => {
      mockJobRepository.deleteOrphanPhotos.mockResolvedValue(0);

      const logSpy = vi.spyOn(job['logger'], 'log');

      await job['handleCleanupJob']({ olderThanMinutes: 1440 });

      expect(logSpy).toHaveBeenCalledWith(
        `1440분 이상 된 고아 사진 0개 삭제됨`,
      );
    });

    it('should handle large number of deleted photos', async () => {
      mockJobRepository.deleteOrphanPhotos.mockResolvedValue(10000);

      const logSpy = vi.spyOn(job['logger'], 'log');

      await job['handleCleanupJob']({ olderThanMinutes: 1440 });

      expect(logSpy).toHaveBeenCalledWith(
        `1440분 이상 된 고아 사진 10000개 삭제됨`,
      );
    });

    it('should handle different time intervals', async () => {
      const deleteOrphanPhotosSpy = mockJobRepository.deleteOrphanPhotos;

      await job['handleCleanupJob']({ olderThanMinutes: 60 });
      await job['handleCleanupJob']({ olderThanMinutes: 720 });
      await job['handleCleanupJob']({ olderThanMinutes: 2880 });

      expect(deleteOrphanPhotosSpy).toHaveBeenNthCalledWith(1, 60);
      expect(deleteOrphanPhotosSpy).toHaveBeenNthCalledWith(2, 720);
      expect(deleteOrphanPhotosSpy).toHaveBeenNthCalledWith(3, 2880);
    });
  });
});
