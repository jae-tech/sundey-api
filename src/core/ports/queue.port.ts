export interface IQueueService {
  addJob<T>(queueName: string, jobName: string, data: T): Promise<void>;
  getQueueStatus(queueName: string): Promise<any>;
}
