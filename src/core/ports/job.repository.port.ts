import { Job, JobPhoto, PhotoType } from '@modules/reservations/domain/job.entity';

export interface IJobRepository {
  findById(id: string): Promise<Job | null>;
  findByReservationId(reservationId: string): Promise<Job | null>;
  create(data: {
    reservationId: string;
    status?: string;
  }): Promise<Job>;
  updateStatus(
    id: string,
    status: string,
  ): Promise<Job>;
  addPhoto(
    jobId: string,
    photo: {
      type: PhotoType;
      photoUrl: string;
      fileName: string;
      uploadedBy?: string;
    },
  ): Promise<JobPhoto>;
  getPhotosByJobId(jobId: string): Promise<JobPhoto[]>;
  getPhotosByType(jobId: string, type: PhotoType): Promise<JobPhoto[]>;
  deletePhoto(photoId: string): Promise<void>;
  deleteOrphanPhotos(olderThanMinutes: number): Promise<number>;
}
