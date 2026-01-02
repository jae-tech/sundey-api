import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUseCase } from '@core/base.usecase';
import { IJobRepository } from '@core/ports/job.repository.port';
import { IReservationRepository } from '@core/ports/reservation.repository.port';
import { JOB_REPOSITORY, RESERVATION_REPOSITORY } from '@core/ports/tokens';
import { JobPhoto, PhotoType } from '../domain/job.entity';
import { ReservationGateway } from '../interface/reservation.gateway';

export interface SaveJobPhotosInput {
  reservationId: string;
  companyId: string;
  photos: Array<{
    type: PhotoType;
    photoUrl: string;
    fileName: string;
    uploadedBy?: string;
  }>;
}

export interface SaveJobPhotosOutput {
  jobId: string;
  savedPhotos: {
    id: string;
    type: PhotoType;
    photoUrl: string;
    fileName: string;
    uploadedAt: Date;
  }[];
}

@Injectable()
export class SaveJobPhotosUseCase implements IUseCase<SaveJobPhotosInput, SaveJobPhotosOutput> {
  constructor(
    @Inject(JOB_REPOSITORY) private readonly jobRepository: IJobRepository,
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    private readonly gateway: ReservationGateway,
  ) {}

  async execute(input: SaveJobPhotosInput): Promise<SaveJobPhotosOutput> {
    // Reservation 존재 확인
    const reservation = await this.reservationRepository.findById(input.reservationId);
    if (!reservation) {
      throw new NotFoundException(
        `Reservation not found with id: ${input.reservationId}`,
      );
    }

    // 회사 소유 확인
    if (reservation.companyId !== input.companyId) {
      throw new NotFoundException(
        `Reservation not found for company: ${input.companyId}`,
      );
    }

    // Job 찾거나 생성
    let job = await this.jobRepository.findByReservationId(input.reservationId);
    if (!job) {
      job = await this.jobRepository.create({
        reservationId: input.reservationId,
        status: 'PENDING',
      });
    }

    // 사진 저장
    const savedPhotos: JobPhoto[] = [];
    for (const photoData of input.photos) {
      // 타입별 최대 10장 제한 확인
      if (!job.canAddPhoto(photoData.type)) {
        throw new Error(
          `Cannot add more photos of type ${photoData.type}. Maximum 10 photos per type.`,
        );
      }

      const savedPhoto = await this.jobRepository.addPhoto(job.id, photoData);
      savedPhotos.push(savedPhoto);
    }

    const result = {
      jobId: job.id,
      savedPhotos: savedPhotos.map((p) => ({
        id: p.id,
        type: p.type,
        photoUrl: p.photoUrl,
        fileName: p.fileName,
        uploadedAt: p.uploadedAt,
      })),
    };

    // 웹소켓으로 사진 저장 이벤트 브로드캐스트
    this.gateway.broadcastPhotosSaved(input.companyId, {
      reservationId: input.reservationId,
      jobId: job.id,
      savedPhotos: result.savedPhotos,
    });

    return result;
  }
}
