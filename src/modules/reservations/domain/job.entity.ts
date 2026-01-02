import { BaseEntity } from '@core/base.entity';

export enum JobStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class Job extends BaseEntity {
  reservationId: string;
  status: JobStatus;
  startedAt?: Date;
  completedAt?: Date;
  photos: JobPhoto[] = [];

  constructor(
    id: string,
    reservationId: string,
    status: JobStatus,
    createdAt: Date,
    updatedAt: Date,
    startedAt?: Date,
    completedAt?: Date,
    photos: JobPhoto[] = [],
  ) {
    super(id, createdAt, updatedAt);
    this.reservationId = reservationId;
    this.status = status;
    this.startedAt = startedAt;
    this.completedAt = completedAt;
    this.photos = photos;
  }

  addPhoto(photo: JobPhoto): void {
    this.photos.push(photo);
  }

  getPhotosByType(type: PhotoType): JobPhoto[] {
    return this.photos.filter((p) => p.type === type);
  }

  hasBeforePhotos(): boolean {
    return this.getPhotosByType(PhotoType.BEFORE).length > 0;
  }

  hasAfterPhotos(): boolean {
    return this.getPhotosByType(PhotoType.AFTER).length > 0;
  }

  canAddPhoto(type: PhotoType): boolean {
    const photos = this.getPhotosByType(type);
    return photos.length < 10;
  }
}

export enum PhotoType {
  BEFORE = 'BEFORE',
  AFTER = 'AFTER',
}

export class JobPhoto extends BaseEntity {
  jobId: string;
  type: PhotoType;
  photoUrl: string;
  fileName: string;
  uploadedBy?: string;
  uploadedAt: Date;

  constructor(
    id: string,
    jobId: string,
    type: PhotoType,
    photoUrl: string,
    fileName: string,
    uploadedAt: Date,
    createdAt: Date,
    updatedAt: Date,
    uploadedBy?: string,
  ) {
    super(id, createdAt, updatedAt);
    this.jobId = jobId;
    this.type = type;
    this.photoUrl = photoUrl;
    this.fileName = fileName;
    this.uploadedAt = uploadedAt;
    this.uploadedBy = uploadedBy;
  }
}
