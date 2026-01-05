import { Job as PrismaJob, JobPhoto as PrismaJobPhoto } from '@prisma/client';
import { Job, JobPhoto, JobStatus, PhotoType } from '../domain/job.entity';

export class JobMapper {
  static toDomain(raw: PrismaJob & { job_photos?: PrismaJobPhoto[] }): Job {
    const photos = (raw.job_photos || []).map((p) => JobMapper.photoToDomain(p));
    return new Job(
      raw.id,
      raw.reservationId,
      raw.status as JobStatus,
      raw.createdAt,
      raw.updatedAt,
      raw.startedAt || undefined,
      raw.completedAt || undefined,
      photos,
    );
  }

  static photoToDomain(raw: PrismaJobPhoto): JobPhoto {
    return new JobPhoto(
      raw.id,
      raw.jobId,
      raw.type as PhotoType,
      raw.photoUrl,
      raw.fileName,
      raw.uploadedAt,
      raw.createdAt,
      raw.updatedAt,
      raw.uploadedBy || undefined,
    );
  }

  static toPrisma(job: Job): {
    id: string;
    reservation_id: string;
    status: string;
    started_at?: Date;
    completed_at?: Date;
    created_at: Date;
    updated_at: Date;
  } {
    return {
      id: job.id,
      reservation_id: job.reservationId,
      status: job.status,
      started_at: job.startedAt,
      completed_at: job.completedAt,
      created_at: job.createdAt,
      updated_at: job.updatedAt,
    };
  }
}
