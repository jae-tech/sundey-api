import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QUEUE_SERVICE } from '@core/ports/tokens';
import { BullMQAdapter } from './infrastructure/bullmq.adapter';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: QUEUE_SERVICE,
      useClass: BullMQAdapter,
    },
  ],
  exports: [QUEUE_SERVICE],
})
export class QueueModule {}
