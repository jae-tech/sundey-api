import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QUEUE_SERVICE } from '@core/ports/tokens';
import { PrismaService } from './infrastructure/prisma.service';
import { BullMQAdapter } from './infrastructure/bullmq.adapter';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    {
      provide: QUEUE_SERVICE,
      useClass: BullMQAdapter,
    },
  ],
  exports: [PrismaService, QUEUE_SERVICE],
})
export class QueueModule {}
