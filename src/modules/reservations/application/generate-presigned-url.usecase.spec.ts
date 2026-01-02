import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { GeneratePresignedUrlUseCase } from './generate-presigned-url.usecase';

describe('GeneratePresignedUrlUseCase', () => {
  let useCase: GeneratePresignedUrlUseCase;
  let mockReservationRepository: any;
  let mockPresignedUrlService: any;

  beforeEach(() => {
    // Mock Reservation Repository
    mockReservationRepository = {
      findById: vi.fn(),
    };

    // Mock PresignedUrlService
    mockPresignedUrlService = {
      generatePresignedUrl: vi.fn(),
    };

    useCase = new GeneratePresignedUrlUseCase(
      mockReservationRepository,
      mockPresignedUrlService,
    );
  });

  describe('execute', () => {
    const validInput = {
      companyId: 'company-1',
      reservationId: 'res-1',
      fileName: 'photo.jpg',
      mimeType: 'image/jpeg',
      type: 'before' as const,
    };

    const mockReservation = {
      id: 'res-1',
      companyId: 'company-1',
      status: 'CONFIRMED',
      createdAt: new Date(),
    };

    const mockPresignedUrl = {
      presignedUrl: 'https://example.com/presigned?signature=xxx',
      objectName: 'company-1/job-res-1/before/photo.jpg',
      bucket: 'test-bucket',
    };

    it('should generate presigned URL successfully', async () => {
      mockReservationRepository.findById.mockResolvedValue(mockReservation);
      mockPresignedUrlService.generatePresignedUrl.mockResolvedValue(
        mockPresignedUrl,
      );

      const result = await useCase.execute(validInput);

      expect(result).toEqual({
        ...mockPresignedUrl,
        expiresIn: 3600,
      });

      expect(mockReservationRepository.findById).toHaveBeenCalledWith('res-1');
      expect(mockPresignedUrlService.generatePresignedUrl).toHaveBeenCalledWith(
        validInput,
      );
    });

    it('should throw NotFoundException when reservation does not exist', async () => {
      mockReservationRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockReservationRepository.findById).toHaveBeenCalledWith('res-1');
      expect(
        mockPresignedUrlService.generatePresignedUrl,
      ).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when reservation does not belong to company', async () => {
      const differentCompanyReservation = {
        ...mockReservation,
        companyId: 'company-2',
      };

      mockReservationRepository.findById.mockResolvedValue(
        differentCompanyReservation,
      );

      await expect(useCase.execute(validInput)).rejects.toThrow(
        BadRequestException,
      );

      expect(
        mockPresignedUrlService.generatePresignedUrl,
      ).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid file name', async () => {
      mockReservationRepository.findById.mockResolvedValue(mockReservation);

      const invalidInput = {
        ...validInput,
        fileName: '',
      };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        BadRequestException,
      );

      expect(
        mockPresignedUrlService.generatePresignedUrl,
      ).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for unsupported MIME type', async () => {
      mockReservationRepository.findById.mockResolvedValue(mockReservation);

      const invalidInput = {
        ...validInput,
        mimeType: 'application/pdf', // PDF is not allowed
      };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        BadRequestException,
      );

      expect(
        mockPresignedUrlService.generatePresignedUrl,
      ).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid type', async () => {
      mockReservationRepository.findById.mockResolvedValue(mockReservation);

      const invalidInput = {
        ...validInput,
        type: 'invalid' as any,
      };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        BadRequestException,
      );

      expect(
        mockPresignedUrlService.generatePresignedUrl,
      ).not.toHaveBeenCalled();
    });
  });

  describe('file type validation', () => {
    const validInput = {
      companyId: 'company-1',
      reservationId: 'res-1',
      fileName: 'photo.jpg',
      mimeType: 'image/jpeg',
      type: 'before' as const,
    };

    const mockReservation = {
      id: 'res-1',
      companyId: 'company-1',
    };

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
    ];

    allowedMimeTypes.forEach((mimeType) => {
      it(`should allow ${mimeType} file type`, async () => {
        mockReservationRepository.findById.mockResolvedValue(mockReservation);
        mockPresignedUrlService.generatePresignedUrl.mockResolvedValue({
          presignedUrl: 'https://example.com',
          objectName: 'test.jpg',
          bucket: 'test',
        });

        const input = {
          ...validInput,
          mimeType,
        };

        await expect(useCase.execute(input)).resolves.toBeDefined();
      });
    });

    const disallowedMimeTypes = [
      'application/json',
      'application/pdf',
      'video/mp4',
      'text/plain',
    ];

    disallowedMimeTypes.forEach((mimeType) => {
      it(`should reject ${mimeType} file type`, async () => {
        mockReservationRepository.findById.mockResolvedValue(mockReservation);

        const input = {
          ...validInput,
          mimeType,
        };

        await expect(useCase.execute(input)).rejects.toThrow(
          BadRequestException,
        );
      });
    });
  });

  describe('type validation', () => {
    const validInput = {
      companyId: 'company-1',
      reservationId: 'res-1',
      fileName: 'photo.jpg',
      mimeType: 'image/jpeg',
      type: 'before' as const,
    };

    const mockReservation = {
      id: 'res-1',
      companyId: 'company-1',
    };

    ['before', 'after'].forEach((type) => {
      it(`should allow type "${type}"`, async () => {
        mockReservationRepository.findById.mockResolvedValue(mockReservation);
        mockPresignedUrlService.generatePresignedUrl.mockResolvedValue({
          presignedUrl: 'https://example.com',
          objectName: 'test.jpg',
          bucket: 'test',
        });

        const input = {
          ...validInput,
          type: type as any,
        };

        await expect(useCase.execute(input)).resolves.toBeDefined();
      });
    });

    ['unknown', 'during', 'other'].forEach((type) => {
      it(`should reject type "${type}"`, async () => {
        mockReservationRepository.findById.mockResolvedValue(mockReservation);

        const input = {
          ...validInput,
          type: type as any,
        };

        await expect(useCase.execute(input)).rejects.toThrow(
          BadRequestException,
        );
      });
    });
  });

  describe('response format', () => {
    it('should return correct response format with expiresIn', async () => {
      const mockReservation = {
        id: 'res-1',
        companyId: 'company-1',
      };

      const mockPresignedUrl = {
        presignedUrl: 'https://example.com/presigned',
        objectName: 'company-1/job-res-1/before/photo.jpg',
        bucket: 'test-bucket',
      };

      mockReservationRepository.findById.mockResolvedValue(mockReservation);
      mockPresignedUrlService.generatePresignedUrl.mockResolvedValue(
        mockPresignedUrl,
      );

      const result = await useCase.execute({
        companyId: 'company-1',
        reservationId: 'res-1',
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        type: 'before',
      });

      expect(result).toHaveProperty('presignedUrl');
      expect(result).toHaveProperty('objectName');
      expect(result).toHaveProperty('bucket');
      expect(result).toHaveProperty('expiresIn');
      expect(result.expiresIn).toBe(3600);
    });
  });
});
