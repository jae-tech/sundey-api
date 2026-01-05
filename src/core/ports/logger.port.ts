/**
 * 로거 포트 (인터페이스)
 *
 * Hexagonal Architecture의 핵심 포트.
 * 애플리케이션 계층은 이 인터페이스를 통해서만 로깅을 수행합니다.
 * 실제 구현(Pino 어댑터)은 infrastructure 계층에서 이루어집니다.
 */
export interface ILoggerPort {
  /**
   * 컨텍스트 설정
   * @param context 로그의 컨텍스트 (일반적으로 클래스 이름)
   */
  setContext(context: string): void;

  /**
   * 일반 로그 기록
   * @param message 로그 메시지
   * @param meta 추가 메타데이터 (선택사항)
   */
  log(message: string, meta?: Record<string, unknown>): void;

  /**
   * 에러 로그 기록
   * @param message 로그 메시지
   * @param error 에러 객체 (선택사항)
   * @param meta 추가 메타데이터 (선택사항)
   */
  error(message: string, error?: unknown, meta?: Record<string, unknown>): void;

  /**
   * 경고 로그 기록
   * @param message 로그 메시지
   * @param meta 추가 메타데이터 (선택사항)
   */
  warn(message: string, meta?: Record<string, unknown>): void;

  /**
   * 디버그 로그 기록
   * @param message 로그 메시지
   * @param meta 추가 메타데이터 (선택사항)
   */
  debug(message: string, meta?: Record<string, unknown>): void;

  /**
   * 정보 로그 기록 (log 메서드와 동일)
   * @param message 로그 메시지
   * @param meta 추가 메타데이터 (선택사항)
   */
  info(message: string, meta?: Record<string, unknown>): void;
}

/**
 * 로거 포트 토큰
 * Dependency Injection에서 ILoggerPort를 주입받을 때 사용하는 토큰입니다.
 */
export const LOGGER_PORT = Symbol('LOGGER_PORT');
