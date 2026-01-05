import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { OciSignatureUtil } from '@common/utils/oci-signature.util';

export interface UploadFileInput {
  companyId: string;
  jobId: string;
  file: Express.Multer.File;
  type: 'before' | 'after';
}

export interface UploadFileOutput {
  objectName: string;
  url: string;
  bucket: string;
}

/**
 * Oracle Object Storage 파일 업로드 서비스
 * 폴더 구조: bucket -> company-{companyId} -> job-{jobId} -> {before|after}/{filename}
 */
@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly namespace: string;
  private readonly bucketName: string;
  private readonly region: string;
  private readonly signatureUtil: OciSignatureUtil;
  private readonly baseUrl: string;

  constructor() {
    this.namespace = process.env.OCI_NAMESPACE || '';
    this.bucketName = process.env.OCI_BUCKET_NAME || '';
    this.region = process.env.OCI_REGION || '';

    const userId = process.env.OCI_USER_ID || '';
    const tenancyId = process.env.OCI_TENANCY_ID || '';
    const fingerprint = process.env.OCI_FINGERPRINT || '';
    const keyPath = process.env.OCI_PRIVATE_KEY_PATH || '';

    if (
      !this.namespace ||
      !this.bucketName ||
      !this.region ||
      !userId ||
      !tenancyId ||
      !fingerprint ||
      !keyPath
    ) {
      this.logger.warn('Oracle Object Storage 설정이 완료되지 않았습니다');
    }

    this.signatureUtil = new OciSignatureUtil(keyPath, fingerprint, tenancyId, userId);

    this.baseUrl = `https://${this.namespace}.compat.objectstorage.${this.region}.oraclecloud.com`;
  }

  /**
   * 파일을 Oracle Object Storage에 업로드
   */
  async uploadFile(input: UploadFileInput): Promise<UploadFileOutput> {
    try {
      // 폴더 경로 생성: company-{companyId}/job-{jobId}/{type}/{filename}
      const folderPath = `company-${input.companyId}/job-${input.jobId}/${input.type}`;
      const objectName = `${folderPath}/${input.file.originalname}`;

      // 파일 업로드
      await this.putObject(objectName, input.file.buffer);

      this.logger.log(`파일 업로드 성공: ${objectName}`);

      return {
        objectName,
        url: `${this.baseUrl}/${this.bucketName}/${objectName}`,
        bucket: this.bucketName,
      };
    } catch (error) {
      this.logger.error(
        `파일 업로드 실패: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : '',
      );
      throw error;
    }
  }

  /**
   * Oracle Object Storage에 파일 PUT
   */
  private async putObject(objectName: string, fileContent: Buffer): Promise<void> {
    const path = `/${this.bucketName}/${objectName}`;
    const host = `${this.namespace}.compat.objectstorage.${this.region}.oraclecloud.com`;
    const date = OciSignatureUtil.getRFC7231Date();

    const headers = {
      host,
      date,
      'content-type': 'application/octet-stream',
      'content-length': fileContent.length.toString(),
    };

    // OCI 서명 생성
    const authorization = this.signatureUtil.buildAuthorizationHeader('PUT', path, headers);

    try {
      await axios.put(`${this.baseUrl}${path}`, fileContent, {
        headers: {
          ...headers,
          authorization,
        },
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(
          `OCI API 오류: ${error.response?.status} ${error.response?.statusText}`,
          error.response?.data,
        );
      }
      throw error;
    }
  }

  /**
   * 예약에 대한 모든 파일 목록 조회
   */
  async listFiles(companyId: string, jobId: string): Promise<string[]> {
    const prefix = `company-${companyId}/job-${jobId}`;
    const path = `/${this.bucketName}?prefix=${prefix}`;
    const host = `${this.namespace}.compat.objectstorage.${this.region}.oraclecloud.com`;
    const date = OciSignatureUtil.getRFC7231Date();

    const headers = {
      host,
      date,
      'content-type': 'application/json',
    };

    const authorization = this.signatureUtil.buildAuthorizationHeader('GET', path, headers);

    try {
      const response = await axios.get(`${this.baseUrl}${path}`, {
        headers: {
          ...headers,
          authorization,
        },
      });

      // XML 응답을 파싱해서 objectName 추출
      const objectNames: string[] = [];
      if (response.data) {
        // contents 배열이 있는 경우
        const regex = /<key>([^<]+)<\/key>/g;
        let match;
        while ((match = regex.exec(response.data)) !== null) {
          objectNames.push(match[1]);
        }
      }

      return objectNames;
    } catch (error) {
      this.logger.error(`파일 목록 조회 실패: ${error.message}`, error.stack);
      throw error;
    }
  }
}
