import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { IQueueService } from '@core/ports/queue.port';

@Injectable()
export class BullMQAdapter implements IQueueService {
  private queues: Map<string, Queue> = new Map();

  constructor(private readonly configService: ConfigService) {}

  private getQueue(queueName: string): Queue {
    if (!this.queues.has(queueName)) {
      const queue = new Queue(queueName, {
        connection: {
          host: this.configService.get('redis.host'),
          port: this.configService.get('redis.port'),
          password: this.configService.get('redis.password'),
        },
      });
      this.queues.set(queueName, queue);
    }
    return this.queues.get(queueName)!;
  }

  async addJob<T>(queueName: string, jobName: string, data: T): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.add(jobName, data);
  }

  async getQueueStatus(queueName: string): Promise<any> {
    const queue = this.getQueue(queueName);
    const counts = await queue.getJobCounts();
    return counts;
  }
}
