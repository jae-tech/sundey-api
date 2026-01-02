import { Injectable, Inject } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Worker } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { IJobRepository } from '@core/ports/job.repository.port';
import { JOB_REPOSITORY } from '@core/ports/tokens';

@Injectable()
export class CleanupOrphanPhotosJob {
  private worker: Worker | null = null;

  constructor(
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    @Inject(JOB_REPOSITORY) private readonly jobRepository: IJobRepository,
  ) {
    this.logger.setContext(CleanupOrphanPhotosJob.name);
  }

  private startWorker(): void {
    const queueName = this.configService.get('BULL_QUEUE_NAME') || 'sundey-queue';

    this.worker = new Worker('cleanup-orphan-photos', this.handleCleanupJob.bind(this), {
      connection: {
        host: this.configService.get('REDIS_HOST') || 'localhost',
        port: this.configService.get('REDIS_PORT') || 6379,
        password: this.configService.get('REDIS_PASSWORD'),
      },
    });

    this.logger.info(`고아 사진 정리 작업 워커 시작됨 (큐: ${queueName})`);
  }

  private async handleCleanupJob(data: { olderThanMinutes: number }): Promise<void> {
    try {
      const olderThanMinutes = data.olderThanMinutes || 1440; // 기본값: 24시간
      const deletedCount = await this.jobRepository.deleteOrphanPhotos(olderThanMinutes);
      this.logger.info(`${olderThanMinutes}분 이상 된 고아 사진 ${deletedCount}개 삭제됨`);
    } catch (error) {
      this.logger.error(`정리 작업 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async scheduleCleanup(cronExpression: string = '0 2 * * *', olderThanMinutes = 1440): Promise<void> {
    const queueName = this.configService.get('BULL_QUEUE_NAME') || 'sundey-queue';
    const { Queue } = await import('bullmq');

    const queue = new Queue(queueName, {
      connection: {
        host: this.configService.get('REDIS_HOST') || 'localhost',
        port: this.configService.get('REDIS_PORT') || 6379,
        password: this.configService.get('REDIS_PASSWORD'),
      },
    });

    await queue.add(
      'cleanup-orphan-photos',
      { olderThanMinutes },
      {
        repeat: {
          pattern: cronExpression,
        },
      },
    );

    this.logger.info(`정리 작업 예약됨 (cron: ${cronExpression})`);
  }
}
