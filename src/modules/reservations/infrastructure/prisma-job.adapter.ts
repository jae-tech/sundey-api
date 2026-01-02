import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/queue/infrastructure/prisma.service';
import { IJobRepository } from '@core/ports/job.repository.port';
import { Job, JobPhoto, PhotoType } from '../domain/job.entity';
import { JobMapper } from './job.mapper';

@Injectable()
export class PrismaJobAdapter implements IJobRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Job | null> {
    const result = await this.prisma.job.findUnique({
      where: { id },
      include: { photos: true },
    });

    if (!result) return null;
    return JobMapper.toDomain(result as any);
  }

  async findByReservationId(reservationId: string): Promise<Job | null> {
    const result = await this.prisma.job.findUnique({
      where: { reservation_id: reservationId },
      include: { photos: true },
    });

    if (!result) return null;
    return JobMapper.toDomain(result as any);
  }

  async create(data: { reservationId: string; status?: string }): Promise<Job> {
    const result = await this.prisma.job.create({
      data: {
        reservation_id: data.reservationId,
        status: data.status || 'PENDING',
      },
      include: { photos: true },
    });

    return JobMapper.toDomain(result as any);
  }

  async updateStatus(id: string, status: string): Promise<Job> {
    const result = await this.prisma.job.update({
      where: { id },
      data: { status },
      include: { photos: true },
    });

    return JobMapper.toDomain(result as any);
  }

  async addPhoto(
    jobId: string,
    photo: {
      type: PhotoType;
      photoUrl: string;
      fileName: string;
      uploadedBy?: string;
    },
  ): Promise<JobPhoto> {
    const result = await this.prisma.jobPhoto.create({
      data: {
        job_id: jobId,
        type: photo.type,
        photo_url: photo.photoUrl,
        file_name: photo.fileName,
        uploaded_by: photo.uploadedBy,
      },
    });

    return JobMapper.photoToDomain(result);
  }

  async getPhotosByJobId(jobId: string): Promise<JobPhoto[]> {
    const results = await this.prisma.jobPhoto.findMany({
      where: { job_id: jobId },
    });

    return results.map((p) => JobMapper.photoToDomain(p));
  }

  async getPhotosByType(jobId: string, type: PhotoType): Promise<JobPhoto[]> {
    const results = await this.prisma.jobPhoto.findMany({
      where: { job_id: jobId, type },
    });

    return results.map((p) => JobMapper.photoToDomain(p));
  }

  async deletePhoto(photoId: string): Promise<void> {
    await this.prisma.jobPhoto.delete({
      where: { id: photoId },
    });
  }

  async deleteOrphanPhotos(olderThanMinutes: number): Promise<number> {
    const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000);

    const result = await this.prisma.jobPhoto.deleteMany({
      where: {
        uploaded_at: {
          lt: cutoffTime,
        },
        job: {
          status: 'CANCELLED',
        },
      },
    });

    return result.count;
  }
}
