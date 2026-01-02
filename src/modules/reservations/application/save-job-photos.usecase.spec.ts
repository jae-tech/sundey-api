import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { SaveJobPhotosUseCase } from './save-job-photos.usecase';
import { PhotoType } from '../domain/job.entity';

describe('SaveJobPhotosUseCase', () => {
  let useCase: SaveJobPhotosUseCase;
  let mockJobRepository: any;
  let mockReservationRepository: any;
  let mockGateway: any;

  beforeEach(() => {
    mockJobRepository = {
      findByReservationId: vi.fn(),
      create: vi.fn(),
      addPhoto: vi.fn(),
    };

    mockReservationRepository = {
      findById: vi.fn(),
    };

    mockGateway = {
      broadcastPhotosSaved: vi.fn(),
    };

    useCase = new SaveJobPhotosUseCase(
      mockJobRepository,
      mockReservationRepository,
      mockGateway,
    );
  });

  it('should save photos successfully', async () => {
    const reservationId = 'res-1';
    const companyId = 'comp-1';
    const photos = [
      {
        type: PhotoType.BEFORE,
        photoUrl: 'https://example.com/before.jpg',
        fileName: 'before.jpg',
        uploadedBy: 'user-1',
      },
    ];

    mockReservationRepository.findById.mockResolvedValue({
      id: reservationId,
      companyId,
      status: 'CONFIRMED',
    });

    mockJobRepository.findByReservationId.mockResolvedValue({
      id: 'job-1',
      reservationId,
      status: 'PENDING',
      canAddPhoto: vi.fn().mockReturnValue(true),
    });

    mockJobRepository.addPhoto.mockResolvedValue({
      id: 'photo-1',
      jobId: 'job-1',
      type: PhotoType.BEFORE,
      photoUrl: 'https://example.com/before.jpg',
      fileName: 'before.jpg',
      uploadedAt: new Date(),
    });

    const result = await useCase.execute({
      reservationId,
      companyId,
      photos,
    });

    expect(result.jobId).toBe('job-1');
    expect(result.savedPhotos).toHaveLength(1);
    expect(result.savedPhotos[0].type).toBe(PhotoType.BEFORE);
    expect(mockGateway.broadcastPhotosSaved).toHaveBeenCalledWith(
      companyId,
      expect.objectContaining({
        reservationId,
        jobId: 'job-1',
      }),
    );
  });

  it('should create job if not exists', async () => {
    const reservationId = 'res-1';
    const companyId = 'comp-1';

    mockReservationRepository.findById.mockResolvedValue({
      id: reservationId,
      companyId,
      status: 'CONFIRMED',
    });

    mockJobRepository.findByReservationId.mockResolvedValue(null);

    mockJobRepository.create.mockResolvedValue({
      id: 'job-new',
      reservationId,
      status: 'PENDING',
      canAddPhoto: vi.fn().mockReturnValue(true),
    });

    mockJobRepository.addPhoto.mockResolvedValue({
      id: 'photo-1',
      jobId: 'job-new',
      type: PhotoType.BEFORE,
      photoUrl: 'https://example.com/before.jpg',
      fileName: 'before.jpg',
      uploadedAt: new Date(),
    });

    await useCase.execute({
      reservationId,
      companyId,
      photos: [
        {
          type: PhotoType.BEFORE,
          photoUrl: 'https://example.com/before.jpg',
          fileName: 'before.jpg',
        },
      ],
    });

    expect(mockJobRepository.create).toHaveBeenCalledWith({
      reservationId,
      status: 'PENDING',
    });
  });

  it('should throw NotFoundException if reservation not found', async () => {
    mockReservationRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        reservationId: 'res-not-exist',
        companyId: 'comp-1',
        photos: [],
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw error if company not matching', async () => {
    mockReservationRepository.findById.mockResolvedValue({
      id: 'res-1',
      companyId: 'comp-other',
      status: 'CONFIRMED',
    });

    await expect(
      useCase.execute({
        reservationId: 'res-1',
        companyId: 'comp-1',
        photos: [],
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw error if max photos reached', async () => {
    const reservationId = 'res-1';
    const companyId = 'comp-1';

    mockReservationRepository.findById.mockResolvedValue({
      id: reservationId,
      companyId,
      status: 'CONFIRMED',
    });

    mockJobRepository.findByReservationId.mockResolvedValue({
      id: 'job-1',
      reservationId,
      status: 'PENDING',
      canAddPhoto: vi.fn().mockReturnValue(false),
    });

    await expect(
      useCase.execute({
        reservationId,
        companyId,
        photos: [
          {
            type: PhotoType.BEFORE,
            photoUrl: 'https://example.com/before.jpg',
            fileName: 'before.jpg',
          },
        ],
      }),
    ).rejects.toThrow('Cannot add more photos');
  });

  it('should save multiple photos', async () => {
    const reservationId = 'res-1';
    const companyId = 'comp-1';
    const photos = [
      {
        type: PhotoType.BEFORE,
        photoUrl: 'https://example.com/before1.jpg',
        fileName: 'before1.jpg',
      },
      {
        type: PhotoType.BEFORE,
        photoUrl: 'https://example.com/before2.jpg',
        fileName: 'before2.jpg',
      },
    ];

    mockReservationRepository.findById.mockResolvedValue({
      id: reservationId,
      companyId,
      status: 'CONFIRMED',
    });

    mockJobRepository.findByReservationId.mockResolvedValue({
      id: 'job-1',
      reservationId,
      status: 'PENDING',
      canAddPhoto: vi.fn().mockReturnValue(true),
    });

    mockJobRepository.addPhoto
      .mockResolvedValueOnce({
        id: 'photo-1',
        jobId: 'job-1',
        type: PhotoType.BEFORE,
        photoUrl: 'https://example.com/before1.jpg',
        fileName: 'before1.jpg',
        uploadedAt: new Date(),
      })
      .mockResolvedValueOnce({
        id: 'photo-2',
        jobId: 'job-1',
        type: PhotoType.BEFORE,
        photoUrl: 'https://example.com/before2.jpg',
        fileName: 'before2.jpg',
        uploadedAt: new Date(),
      });

    const result = await useCase.execute({
      reservationId,
      companyId,
      photos,
    });

    expect(result.savedPhotos).toHaveLength(2);
    expect(mockJobRepository.addPhoto).toHaveBeenCalledTimes(2);
  });
});
