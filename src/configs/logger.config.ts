import { LoggerModuleAsyncParams } from '@nestjs/pino';

export const pinoLoggerConfig = (): LoggerModuleAsyncParams => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    useFactory: async () => {
      return {
        pinoHttp: {
          level: isProduction ? 'info' : 'debug',
          transport: !isProduction
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: false,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                  customPrettifiers: {
                    level: (logLevel: number) => {
                      const levels: { [key: number]: string } = {
                        10: '트레이스',
                        20: '디버그',
                        30: '정보',
                        40: '경고',
                        50: '에러',
                        60: '심각',
                      };
                      return levels[logLevel] || '알 수 없음';
                    },
                  },
                },
              }
            : undefined,
        },
      };
    },
  };
};
