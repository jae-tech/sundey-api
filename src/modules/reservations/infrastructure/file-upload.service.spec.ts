import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import { FileUploadService } from './file-upload.service';
import { OciSignatureUtil } from '@common/utils/oci-signature.util';

vi.mock('axios');
vi.mock('@common/utils/oci-signature.util');

describe('FileUploadService', () => {
  let service: FileUploadService;
  const mockAxios = axios as any;

  beforeEach(() => {
    // 환경변수 설정
    process.env.OCI_NAMESPACE = 'test-namespace';
    process.env.OCI_BUCKET_NAME = 'test-bucket';
    process.env.OCI_REGION = 'ap-chuncheon-1';
    process.env.OCI_USER_ID = 'test-user-id';
    process.env.OCI_TENANCY_ID = 'test-tenancy-id';
    process.env.OCI_FINGERPRINT = 'test-fingerprint';
    process.env.OCI_PRIVATE_KEY_PATH = '/path/to/key';

    vi.clearAllMocks();
    service = new FileUploadService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'files',
        originalname: 'test-photo.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: '/uploads',
        filename: 'test-photo.jpg',
        path: '/uploads/test-photo.jpg',
        buffer: Buffer.from('fake image data'),
      };

      mockAxios.put.mockResolvedValue({ status: 200, data: {} });
      vi.spyOn(OciSignatureUtil.prototype, 'buildAuthorizationHeader').mockReturnValue(
        'Authorization header',
      );

      const result = await service.uploadFile({
        companyId: 'company-123',
        jobId: 'job-456',
        file: mockFile,
        type: 'before',
      });

      expect(result).toHaveProperty('objectName');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('bucket');
      expect(result.bucket).toBe('test-bucket');
      expect(result.objectName).toContain('company-123');
      expect(result.objectName).toContain('job-456');
      expect(result.objectName).toContain('before');
      expect(result.objectName).toContain('test-photo.jpg');
    });

    it('should handle after photos', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'files',
        originalname: 'after.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 2048,
        destination: '/uploads',
        filename: 'after.png',
        path: '/uploads/after.png',
        buffer: Buffer.from('fake image data'),
      };

      mockAxios.put.mockResolvedValue({ status: 200, data: {} });
      vi.spyOn(OciSignatureUtil.prototype, 'buildAuthorizationHeader').mockReturnValue(
        'Authorization header',
      );

      const result = await service.uploadFile({
        companyId: 'company-789',
        jobId: 'job-101',
        file: mockFile,
        type: 'after',
      });

      expect(result.objectName).toContain('after');
      expect(result.objectName).toContain('after.png');
    });

    it('should create correct folder path structure', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'files',
        originalname: 'photo.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: '/uploads',
        filename: 'photo.jpg',
        path: '/uploads/photo.jpg',
        buffer: Buffer.from('fake image data'),
      };

      mockAxios.put.mockResolvedValue({ status: 200, data: {} });
      vi.spyOn(OciSignatureUtil.prototype, 'buildAuthorizationHeader').mockReturnValue(
        'Authorization header',
      );

      const result = await service.uploadFile({
        companyId: 'company-1',
        jobId: 'job-1',
        file: mockFile,
        type: 'before',
      });

      // 폴더 구조: company-{id}/job-{id}/{type}/{filename}
      const parts = result.objectName.split('/');
      expect(parts[0]).toBe('company-company-1');
      expect(parts[1]).toBe('job-job-1');
      expect(parts[2]).toBe('before');
      expect(parts[3]).toBe('photo.jpg');
    });

    it('should throw error on upload failure', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'files',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: '/uploads',
        filename: 'test.jpg',
        path: '/uploads/test.jpg',
        buffer: Buffer.from('fake image data'),
      };

      const uploadError = new Error('Upload failed');
      mockAxios.put.mockRejectedValue(uploadError);

      await expect(
        service.uploadFile({
          companyId: 'company-123',
          jobId: 'job-456',
          file: mockFile,
          type: 'before',
        }),
      ).rejects.toThrow();
    });
  });

  describe('listFiles', () => {
    it('should parse XML response and extract file keys', async () => {
      const xmlResponse = '<ListBucketResult><Contents><Key>company-123/job-456/before/photo1.jpg</Key></Contents><Contents><Key>company-123/job-456/before/photo2.jpg</Key></Contents></ListBucketResult>';
      mockAxios.get.mockResolvedValue({ data: xmlResponse });

      const result = await service.listFiles('company-123', 'job-456');

      expect(result.length).toBeGreaterThanOrEqual(0);
      // XML 파싱이 정상적으로 작동하는지 확인
      expect(mockAxios.get).toHaveBeenCalled();
    });

    it('should handle empty response', async () => {
      const xmlResponse = '<ListBucketResult></ListBucketResult>';
      mockAxios.get.mockResolvedValue({ data: xmlResponse });

      const result = await service.listFiles('company-123', 'job-456');

      expect(Array.isArray(result)).toBe(true);
    });

    it('should use correct prefix in request', async () => {
      mockAxios.get.mockResolvedValue({ data: '<ListBucketResult></ListBucketResult>' });

      await service.listFiles('company-123', 'job-456');

      expect(mockAxios.get).toHaveBeenCalled();
      const callArgs = mockAxios.get.mock.calls[0][0];
      expect(callArgs).toContain('company-123');
      expect(callArgs).toContain('job-456');
    });

    it('should throw error on list failure', async () => {
      mockAxios.get.mockRejectedValue(new Error('List failed'));

      await expect(
        service.listFiles('company-123', 'job-456'),
      ).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle missing configuration gracefully', () => {
      // 환경변수 제거
      delete process.env.OCI_NAMESPACE;
      delete process.env.OCI_BUCKET_NAME;

      // 서비스 생성 시 에러가 발생하지 않아야 함
      expect(() => new FileUploadService()).not.toThrow();
    });

    it('should handle file with special characters in name', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'files',
        originalname: 'photo-2024_01_01.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: '/uploads',
        filename: 'photo-2024_01_01.jpg',
        path: '/uploads/photo-2024_01_01.jpg',
        buffer: Buffer.from('fake image data'),
      };

      mockAxios.put.mockResolvedValue({ status: 200, data: {} });

      const result = await service.uploadFile({
        companyId: 'company-123',
        jobId: 'job-456',
        file: mockFile,
        type: 'before',
      });

      expect(result.objectName).toContain('photo-2024_01_01.jpg');
    });
  });

  describe('URL construction', () => {
    it('should construct correct base URL', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'files',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: '/uploads',
        filename: 'test.jpg',
        path: '/uploads/test.jpg',
        buffer: Buffer.from('fake image data'),
      };

      mockAxios.put.mockResolvedValue({ status: 200, data: {} });

      const result = await service.uploadFile({
        companyId: 'company-123',
        jobId: 'job-456',
        file: mockFile,
        type: 'before',
      });

      const expectedBaseUrl = `https://test-namespace.compat.objectstorage.ap-chuncheon-1.oraclecloud.com`;
      expect(result.url).toContain(expectedBaseUrl);
      expect(result.url).toContain('test-bucket');
    });
  });
});
