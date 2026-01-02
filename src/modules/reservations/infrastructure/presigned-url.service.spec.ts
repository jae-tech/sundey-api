import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PresignedUrlService } from './presigned-url.service';

describe('PresignedUrlService', () => {
  let service: PresignedUrlService;

  beforeEach(() => {
    // 환경변수 설정
    process.env.OCI_S3_ENDPOINT =
      'https://test.compat.objectstorage.ap-chuncheon-1.oraclecloud.com';
    process.env.OCI_ACCESS_KEY_ID = 'test-access-key';
    process.env.OCI_SECRET_ACCESS_KEY = 'test-secret-key';
    process.env.OCI_BUCKET_NAME = 'test-bucket';

    service = new PresignedUrlService();
  });

  describe('generatePresignedUrl', () => {
    it('should generate presigned URL with correct object path', async () => {
      const input = {
        companyId: 'company-123',
        reservationId: 'reservation-456',
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        type: 'before' as const,
      };

      const result = await service.generatePresignedUrl(input);

      // 결과 검증
      expect(result).toHaveProperty('presignedUrl');
      expect(result).toHaveProperty('objectName');
      expect(result).toHaveProperty('bucket');

      // 객체 이름 경로 검증
      expect(result.objectName).toBe(
        'company-company-123/job-reservation-456/before/photo.jpg',
      );

      // 버킷 이름 검증
      expect(result.bucket).toBe('test-bucket');

      // presignedUrl이 문자열인지 확인
      expect(typeof result.presignedUrl).toBe('string');
      expect(result.presignedUrl.length).toBeGreaterThan(0);
    });

    it('should generate presigned URL for after photos', async () => {
      const input = {
        companyId: 'company-789',
        reservationId: 'reservation-101',
        fileName: 'cleaned-photo.png',
        mimeType: 'image/png',
        type: 'after' as const,
      };

      const result = await service.generatePresignedUrl(input);

      expect(result.objectName).toBe(
        'company-company-789/job-reservation-101/after/cleaned-photo.png',
      );
    });

    it('should handle multiple file uploads with different names', async () => {
      const inputs = [
        {
          companyId: 'company-1',
          reservationId: 'res-1',
          fileName: 'photo1.jpg',
          mimeType: 'image/jpeg',
          type: 'before' as const,
        },
        {
          companyId: 'company-1',
          reservationId: 'res-1',
          fileName: 'photo2.jpg',
          mimeType: 'image/jpeg',
          type: 'before' as const,
        },
      ];

      const results = await Promise.all(
        inputs.map((input) => service.generatePresignedUrl(input)),
      );

      expect(results).toHaveLength(2);
      expect(results[0].objectName).toContain('photo1.jpg');
      expect(results[1].objectName).toContain('photo2.jpg');
    });

    it('should include proper folder structure in object name', async () => {
      const input = {
        companyId: 'test-company',
        reservationId: 'test-reservation',
        fileName: 'test-file.webp',
        mimeType: 'image/webp',
        type: 'before' as const,
      };

      const result = await service.generatePresignedUrl(input);

      // 폴더 구조 검증: company-{id}/job-{id}/{type}/{filename}
      const parts = result.objectName.split('/');
      expect(parts).toHaveLength(4);
      expect(parts[0]).toBe('company-test-company');
      expect(parts[1]).toBe('job-test-reservation');
      expect(parts[2]).toBe('before');
      expect(parts[3]).toBe('test-file.webp');
    });
  });

  describe('error handling', () => {
    it('should handle missing configuration gracefully', () => {
      // 환경변수 제거
      delete process.env.OCI_S3_ENDPOINT;
      delete process.env.OCI_ACCESS_KEY_ID;
      delete process.env.OCI_SECRET_ACCESS_KEY;

      // 서비스 생성 시 에러가 발생하지 않아야 함
      expect(() => new PresignedUrlService()).not.toThrow();
    });

    it('should generate URL even with partial configuration', async () => {
      process.env.OCI_S3_ENDPOINT = 'https://test.example.com';
      process.env.OCI_ACCESS_KEY_ID = 'test-key';
      process.env.OCI_SECRET_ACCESS_KEY = 'test-secret';
      process.env.OCI_BUCKET_NAME = 'test-bucket';

      service = new PresignedUrlService();

      const input = {
        companyId: 'company-1',
        reservationId: 'res-1',
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        type: 'before' as const,
      };

      const result = await service.generatePresignedUrl(input);

      expect(result).toBeDefined();
      expect(result.presignedUrl).toBeTruthy();
    });
  });

  describe('URL characteristics', () => {
    it('presigned URL should be a valid S3 format', async () => {
      const input = {
        companyId: 'company-1',
        reservationId: 'res-1',
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        type: 'before' as const,
      };

      const result = await service.generatePresignedUrl(input);

      // URL이 유효한 형식인지 확인
      expect(() => new URL(result.presignedUrl)).not.toThrow();
    });

    it('presigned URL should contain X-Amz-Signature parameter', async () => {
      const input = {
        companyId: 'company-1',
        reservationId: 'res-1',
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        type: 'before' as const,
      };

      const result = await service.generatePresignedUrl(input);
      const url = new URL(result.presignedUrl);

      // AWS 서명 파라미터 확인
      expect(url.searchParams.has('X-Amz-Signature')).toBe(true);
      expect(url.searchParams.has('X-Amz-Algorithm')).toBe(true);
      expect(url.searchParams.has('X-Amz-Credential')).toBe(true);
    });
  });
});
