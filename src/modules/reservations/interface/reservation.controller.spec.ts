import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { GeneratePresignedUrlUseCase } from '../application/generate-presigned-url.usecase';
import { CreateReservationUseCase } from '../application/create-reservation.usecase';
import { ConfirmReservationUseCase } from '../application/confirm-reservation.usecase';
import { AssignUserUseCase } from '../application/assign-user.usecase';
import { UpdateReservationStatusUseCase } from '../application/update-status.usecase';
import { MarkReservationPaidUseCase } from '../application/mark-paid.usecase';
import { GetUnpaidReservationsUseCase } from '../application/get-unpaid-reservations.usecase';
import { UploadPhotosUseCase } from '../application/upload-photos.usecase';

describe('ReservationController - Presigned URL Endpoint', () => {
  let controller: ReservationController;
  let mockGeneratePresignedUrlUseCase: any;
  let mockCreateReservationUseCase: any;
  let mockConfirmReservationUseCase: any;
  let mockAssignUserUseCase: any;
  let mockUpdateStatusUseCase: any;
  let mockMarkPaidUseCase: any;
  let mockGetUnpaidUseCase: any;
  let mockUploadPhotosUseCase: any;

  beforeEach(() => {
    mockGeneratePresignedUrlUseCase = {
      execute: vi.fn(),
    };

    mockCreateReservationUseCase = {
      execute: vi.fn(),
    };

    mockConfirmReservationUseCase = {
      execute: vi.fn(),
    };

    mockAssignUserUseCase = {
      execute: vi.fn(),
    };

    mockUpdateStatusUseCase = {
      execute: vi.fn(),
    };

    mockMarkPaidUseCase = {
      execute: vi.fn(),
    };

    mockGetUnpaidUseCase = {
      execute: vi.fn(),
    };

    mockUploadPhotosUseCase = {
      execute: vi.fn(),
    };

    controller = new ReservationController(
      mockCreateReservationUseCase,
      mockConfirmReservationUseCase,
      mockAssignUserUseCase,
      mockUpdateStatusUseCase,
      mockMarkPaidUseCase,
      mockGetUnpaidUseCase,
      mockUploadPhotosUseCase,
      mockGeneratePresignedUrlUseCase,
    );
  });

  describe('generatePresignedUrl', () => {
    it('should generate presigned URL successfully', async () => {
      const mockResponse = {
        presignedUrl: 'https://example.com/presigned?signature=xxx',
        objectName: 'company-temp-company-id/job-res-1/before/photo.jpg',
        bucket: 'test-bucket',
        expiresIn: 3600,
      };

      mockGeneratePresignedUrlUseCase.execute.mockResolvedValue(mockResponse);

      const result = await controller.generatePresignedUrl('res-1', 'before', {
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        type: 'before',
      });

      expect(result).toEqual(mockResponse);

      expect(mockGeneratePresignedUrlUseCase.execute).toHaveBeenCalledWith({
        companyId: 'temp-company-id',
        reservationId: 'res-1',
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        type: 'before',
      });
    });

    it('should throw BadRequestException for invalid type parameter', async () => {
      await expect(
        controller.generatePresignedUrl('res-1', 'invalid' as any, {
          fileName: 'photo.jpg',
          mimeType: 'image/jpeg',
          type: 'before',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockGeneratePresignedUrlUseCase.execute).not.toHaveBeenCalled();
    });

    it('should accept "before" type', async () => {
      const mockResponse = {
        presignedUrl: 'https://example.com/presigned',
        objectName: 'company-temp-company-id/job-res-1/before/photo.jpg',
        bucket: 'test-bucket',
        expiresIn: 3600,
      };

      mockGeneratePresignedUrlUseCase.execute.mockResolvedValue(mockResponse);

      const result = await controller.generatePresignedUrl('res-1', 'before', {
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        type: 'before',
      });

      expect(result).toBeDefined();

      const callArgs = mockGeneratePresignedUrlUseCase.execute.mock.calls[0][0];
      expect(callArgs.type).toBe('before');
    });

    it('should accept "after" type', async () => {
      const mockResponse = {
        presignedUrl: 'https://example.com/presigned',
        objectName: 'company-temp-company-id/job-res-1/after/photo.jpg',
        bucket: 'test-bucket',
        expiresIn: 3600,
      };

      mockGeneratePresignedUrlUseCase.execute.mockResolvedValue(mockResponse);

      const result = await controller.generatePresignedUrl('res-1', 'after', {
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        type: 'after',
      });

      expect(result).toBeDefined();

      const callArgs = mockGeneratePresignedUrlUseCase.execute.mock.calls[0][0];
      expect(callArgs.type).toBe('after');
    });

    it('should pass correct reservation ID to use case', async () => {
      const mockResponse = {
        presignedUrl: 'https://example.com/presigned',
        objectName: 'company-temp-company-id/job-res-123/before/photo.jpg',
        bucket: 'test-bucket',
        expiresIn: 3600,
      };

      mockGeneratePresignedUrlUseCase.execute.mockResolvedValue(mockResponse);

      await controller.generatePresignedUrl('res-123', 'before', {
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        type: 'before',
      });

      const callArgs = mockGeneratePresignedUrlUseCase.execute.mock.calls[0][0];
      expect(callArgs.reservationId).toBe('res-123');
    });

    it('should pass file metadata to use case', async () => {
      const mockResponse = {
        presignedUrl: 'https://example.com/presigned',
        objectName: 'company-temp-company-id/job-res-1/before/test.png',
        bucket: 'test-bucket',
        expiresIn: 3600,
      };

      mockGeneratePresignedUrlUseCase.execute.mockResolvedValue(mockResponse);

      const dto = {
        fileName: 'test-photo.png',
        mimeType: 'image/png',
        type: 'before' as const,
      };

      await controller.generatePresignedUrl('res-1', 'before', dto);

      const callArgs = mockGeneratePresignedUrlUseCase.execute.mock.calls[0][0];
      expect(callArgs.fileName).toBe('test-photo.png');
      expect(callArgs.mimeType).toBe('image/png');
    });
  });

  describe('error handling', () => {
    it('should handle use case exceptions', async () => {
      const testError = new Error('Service error');
      mockGeneratePresignedUrlUseCase.execute.mockRejectedValue(testError);

      await expect(
        controller.generatePresignedUrl('res-1', 'before', {
          fileName: 'photo.jpg',
          mimeType: 'image/jpeg',
          type: 'before',
        }),
      ).rejects.toThrow('Service error');
    });

    it('should validate type parameter before calling use case', async () => {
      const invalidTypes = ['during', 'middle', 'processing', ''];

      for (const invalidType of invalidTypes) {
        await expect(
          controller.generatePresignedUrl('res-1', invalidType as any, {
            fileName: 'photo.jpg',
            mimeType: 'image/jpeg',
            type: 'before',
          }),
        ).rejects.toThrow(BadRequestException);
      }

      expect(mockGeneratePresignedUrlUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('request/response format', () => {
    it('should return presigned URL response', async () => {
      const mockResponse = {
        presignedUrl:
          'https://axz9kv2z70xa.compat.objectstorage.ap-chuncheon-1.oraclecloud.com/sundey-cleaning-reviews/company-temp-company-id/job-res-1/before/photo.jpg?X-Amz-Signature=...',
        objectName: 'company-temp-company-id/job-res-1/before/photo.jpg',
        bucket: 'sundey-cleaning-reviews',
        expiresIn: 3600,
      };

      mockGeneratePresignedUrlUseCase.execute.mockResolvedValue(mockResponse);

      const result = await controller.generatePresignedUrl('res-1', 'before', {
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        type: 'before',
      });

      // 응답 형식 검증
      expect(result).toHaveProperty('presignedUrl');
      expect(result).toHaveProperty('objectName');
      expect(result).toHaveProperty('bucket');
      expect(result).toHaveProperty('expiresIn');

      // 값 검증
      expect(typeof result.presignedUrl).toBe('string');
      expect(typeof result.objectName).toBe('string');
      expect(typeof result.bucket).toBe('string');
      expect(typeof result.expiresIn).toBe('number');
    });

    it('should include company ID in response', async () => {
      const mockResponse = {
        presignedUrl: 'https://example.com/presigned',
        objectName: 'company-temp-company-id/job-res-1/before/photo.jpg',
        bucket: 'test-bucket',
        expiresIn: 3600,
      };

      mockGeneratePresignedUrlUseCase.execute.mockResolvedValue(mockResponse);

      const result = await controller.generatePresignedUrl('res-1', 'before', {
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        type: 'before',
      });

      expect(result.objectName).toContain('company-');
    });
  });
});
