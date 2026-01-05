import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface PresignedUrlInput {
  companyId: string;
  reservationId: string;
  fileName: string;
  mimeType: string;
  type: 'before' | 'after';
}

export interface PresignedUrlOutput {
  presignedUrl: string;
  objectName: string;
  bucket: string;
}

@Injectable()
export class PresignedUrlService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly logger = new Logger(PresignedUrlService.name);

  constructor() {

    const endpoint = process.env.OCI_S3_ENDPOINT;
    const accessKeyId = process.env.OCI_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.OCI_SECRET_ACCESS_KEY || '';
    this.bucketName = process.env.OCI_BUCKET_NAME || '';

    if (!endpoint || !accessKeyId || !secretAccessKey || !this.bucketName) {
      this.logger.warn('S3/OCI 설정이 완료되지 않았습니다');
    }

    this.s3Client = new S3Client({
      region: 'ap-chuncheon-1',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * 프리사인된 업로드 URL 생성
   */
  async generatePresignedUrl(
    input: PresignedUrlInput,
  ): Promise<PresignedUrlOutput> {
    try {
      // 폴더 경로: company-{companyId}/job-{reservationId}/{type}/{filename}
      const folderPath = `company-${input.companyId}/job-${input.reservationId}/${input.type}`;
      const objectName = `${folderPath}/${input.fileName}`;

      // PutObject 명령 생성
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: objectName,
        ContentType: input.mimeType,
      });

      // 1시간 유효한 프리사인 URL 생성
      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });

      this.logger.log(`프리사인 URL 생성 성공: ${objectName}`);

      return {
        presignedUrl,
        objectName,
        bucket: this.bucketName,
      };
    } catch (error) {
      this.logger.error(
        `프리사인 URL 생성 실패: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : '',
      );
      throw error;
    }
  }
}
