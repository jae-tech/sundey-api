import { LoggerModuleAsyncParams } from 'nestjs-pino';

export const pinoLoggerConfig = (): LoggerModuleAsyncParams => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    useFactory: () => {
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
                },
              }
            : undefined,
        },
      };
    },
  };
};
