import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Oracle Cloud Infrastructure Signature Version 4 생성
 * RESTful API 호출 시 인증에 필요
 */
export class OciSignatureUtil {
  private privateKey: string;
  private keyId: string;

  constructor(
    privateKeyPath: string,
    fingerprint: string,
    tenancyId: string,
    userId: string,
  ) {
    // 홈 디렉토리 경로 결정 (Windows와 Unix 호환)
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';

    // 경로 확장: ~ 또는 ~/ 처리
    let expandedPath = privateKeyPath;
    if (expandedPath.startsWith('~/')) {
      expandedPath = path.join(homeDir, expandedPath.slice(2));
    } else if (expandedPath === '~') {
      expandedPath = homeDir;
    }

    // 절대경로 결정
    const absolutePath = path.isAbsolute(expandedPath)
      ? expandedPath
      : path.resolve(expandedPath); // 상대경로는 현재 디렉토리 기준으로 절대경로 변환

    try {
      this.privateKey = fs.readFileSync(absolutePath, 'utf-8');
    } catch {
      // 개발 환경에서 키 파일이 없을 수 있으므로 경고만 출력
      console.warn(
        `⚠️  ${absolutePath}에서 OCI 개인키 파일을 찾을 수 없습니다. 이 파일이 설정될 때까지 파일 업로드가 실패합니다.`,
      );
      this.privateKey = '';
    }

    this.keyId = `${tenancyId}/${userId}/${fingerprint}`;
  }

  /**
   * OCI Signature Version 4 생성
   */
  generateSignature(
    method: string,
    path: string,
    headers: Record<string, string>,
    body?: string,
  ): string {
    // 서명할 문자열 생성
    const signingString = this.buildSigningString(method, path, headers, body);

    // RSA-SHA256으로 서명
    const signature = crypto
      .createSign('RSA-SHA256')
      .update(signingString, 'utf-8')
      .sign(this.privateKey, 'base64');

    return signature;
  }

  /**
   * Authorization 헤더 생성
   */
  buildAuthorizationHeader(
    method: string,
    path: string,
    headers: Record<string, string>,
    body?: string,
  ): string {
    const signature = this.generateSignature(method, path, headers, body);

    // 서명에 포함된 헤더 목록
    const signedHeaders = ['(request-target)', 'host', 'date', 'content-type']
      .filter((h) => h === '(request-target)' || h in headers)
      .join(' ');

    return `Signature version="1",keyId="${this.keyId}",algorithm="rsa-sha256",headers="${signedHeaders}",signature="${signature}"`;
  }

  /**
   * 서명할 문자열 생성
   */
  private buildSigningString(
    method: string,
    path: string,
    headers: Record<string, string>,
    body?: string,
  ): string {
    const lines: string[] = [];

    // Request Target Line
    lines.push(`(request-target): ${method.toLowerCase()} ${path}`);

    // Host
    if (headers.host) {
      lines.push(`host: ${headers.host}`);
    }

    // Date
    if (headers.date) {
      lines.push(`date: ${headers.date}`);
    }

    // Content-Type
    if (headers['content-type']) {
      lines.push(`content-type: ${headers['content-type']}`);
    }

    return lines.join('\n');
  }

  /**
   * RFC7231 형식의 현재 시간 반환
   */
  static getRFC7231Date(): string {
    const now = new Date();
    return now.toUTCString();
  }
}
