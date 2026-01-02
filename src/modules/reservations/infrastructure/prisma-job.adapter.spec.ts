import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaJobAdapter } from './prisma-job.adapter';
import { PhotoType } from '../domain/job.entity';

describe('PrismaJobAdapter', () => {
  let adapter: PrismaJobAdapter;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      job: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      jobPhoto: {
        create: vi.fn(),
        findMany: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
      },
    };

    adapter = new PrismaJobAdapter(mockPrisma);
  });

  describe('findById', () => {
    it('should return job by id', async () => {
      const jobData = {
        id: 'job-1',
        reservation_id: 'res-1',
        status: 'PENDING',
        created_at: new Date(),
        updated_at: new Date(),
        started_at: null,
        completed_at: null,
        job_photos: [],
      };

      mockPrisma.job.findUnique.mockResolvedValue(jobData);

      const result = await adapter.findById('job-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('job-1');
      expect(mockPrisma.job.findUnique).toHaveBeenCalledWith({
        where: { id: 'job-1' },
        include: { photos: true },
      });
    });

    it('should return null if job not found', async () => {
      mockPrisma.job.findUnique.mockResolvedValue(null);

      const result = await adapter.findById('job-not-exist');

      expect(result).toBeNull();
    });
  });

  describe('findByReservationId', () => {
    it('should return job by reservation id', async () => {
      const jobData = {
        id: 'job-1',
        reservation_id: 'res-1',
        status: 'PENDING',
        created_at: new Date(),
        updated_at: new Date(),
        started_at: null,
        completed_at: null,
        job_photos: [],
      };

      mockPrisma.job.findUnique.mockResolvedValue(jobData);

      const result = await adapter.findByReservationId('res-1');

      expect(result).toBeDefined();
      expect(result?.reservationId).toBe('res-1');
    });
  });

  describe('create', () => {
    it('should create a new job', async () => {
      const jobData = {
        id: 'job-new',
        reservation_id: 'res-1',
        status: 'PENDING',
        created_at: new Date(),
        updated_at: new Date(),
        started_at: null,
        completed_at: null,
        job_photos: [],
      };

      mockPrisma.job.create.mockResolvedValue(jobData);

      const result = await adapter.create({
        reservationId: 'res-1',
        status: 'PENDING',
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('job-new');
      expect(mockPrisma.job.create).toHaveBeenCalledWith({
        data: {
          reservation_id: 'res-1',
          status: 'PENDING',
        },
        include: { photos: true },
      });
    });
  });

  describe('updateStatus', () => {
    it('should update job status', async () => {
      const jobData = {
        id: 'job-1',
        reservation_id: 'res-1',
        status: 'IN_PROGRESS',
        created_at: new Date(),
        updated_at: new Date(),
        started_at: new Date(),
        completed_at: null,
        job_photos: [],
      };

      mockPrisma.job.update.mockResolvedValue(jobData);

      const result = await adapter.updateStatus('job-1', 'IN_PROGRESS');

      expect(result).toBeDefined();
      expect(mockPrisma.job.update).toHaveBeenCalledWith({
        where: { id: 'job-1' },
        data: { status: 'IN_PROGRESS' },
        include: { photos: true },
      });
    });
  });

  describe('addPhoto', () => {
    it('should add photo to job', async () => {
      const photoData = {
        id: 'photo-1',
        job_id: 'job-1',
        type: 'BEFORE',
        photo_url: 'https://example.com/before.jpg',
        file_name: 'before.jpg',
        uploaded_by: 'user-1',
        uploaded_at: new Date(),
        created_at: new Date(),
      };

      mockPrisma.jobPhoto.create.mockResolvedValue(photoData);

      const result = await adapter.addPhoto('job-1', {
        type: PhotoType.BEFORE,
        photoUrl: 'https://example.com/before.jpg',
        fileName: 'before.jpg',
        uploadedBy: 'user-1',
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('photo-1');
      expect(mockPrisma.jobPhoto.create).toHaveBeenCalledWith({
        data: {
          job_id: 'job-1',
          type: PhotoType.BEFORE,
          photo_url: 'https://example.com/before.jpg',
          file_name: 'before.jpg',
          uploaded_by: 'user-1',
        },
      });
    });
  });

  describe('getPhotosByJobId', () => {
    it('should return all photos for job', async () => {
      const photos = [
        {
          id: 'photo-1',
          job_id: 'job-1',
          type: 'BEFORE',
          photo_url: 'https://example.com/before.jpg',
          file_name: 'before.jpg',
          uploaded_by: 'user-1',
          uploaded_at: new Date(),
          created_at: new Date(),
        },
      ];

      mockPrisma.jobPhoto.findMany.mockResolvedValue(photos);

      const result = await adapter.getPhotosByJobId('job-1');

      expect(result).toHaveLength(1);
      expect(mockPrisma.jobPhoto.findMany).toHaveBeenCalledWith({
        where: { job_id: 'job-1' },
      });
    });
  });

  describe('deleteOrphanPhotos', () => {
    it('should delete orphan photos older than specified minutes', async () => {
      mockPrisma.jobPhoto.deleteMany.mockResolvedValue({ count: 5 });

      const result = await adapter.deleteOrphanPhotos(1440);

      expect(result).toBe(5);
      expect(mockPrisma.jobPhoto.deleteMany).toHaveBeenCalled();
    });
  });
});
