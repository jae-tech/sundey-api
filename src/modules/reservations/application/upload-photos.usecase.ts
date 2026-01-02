import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IUseCase } from '@core/base.usecase';
import type { IReservationRepository } from '@core/ports/reservation.repository.port';
import { RESERVATION_REPOSITORY } from '@core/ports/tokens';
import {
  FileUploadService,
  UploadFileOutput,
} from '../infrastructure/file-upload.service';

export class UploadPhotosInput {
  reservationId: string;
  companyId: string;
  files: Express.Multer.File[];
  type: 'before' | 'after';
}

export interface UploadPhotosOutput {
  reservationId: string;
  uploadedPhotos: UploadFileOutput[];
  totalUploaded: number;
}

@Injectable()
export class UploadPhotosUseCase implements IUseCase<
  UploadPhotosInput,
  UploadPhotosOutput
> {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async execute(input: UploadPhotosInput): Promise<UploadPhotosOutput> {
    // 예약 존재 확인
    const reservation = await this.reservationRepository.findById(
      input.reservationId,
    );
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // 회사 ID 검증
    if (reservation.companyId !== input.companyId) {
      throw new BadRequestException(
        'Reservation does not belong to this company',
      );
    }

    // 파일 검증
    if (!input.files || input.files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // 파일 크기 검증 (10MB 제한)
    const maxFileSize = 10 * 1024 * 1024;
    for (const file of input.files) {
      if (file.size > maxFileSize) {
        throw new BadRequestException(
          `File ${file.originalname} exceeds 10MB limit`,
        );
      }
    }

    // 파일 타입 검증 (이미지만 허용)
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
    ];
    for (const file of input.files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `File type ${file.mimetype} is not allowed`,
        );
      }
    }

    // 파일 업로드
    const uploadedPhotos: UploadFileOutput[] = [];
    for (const file of input.files) {
      const result = await this.fileUploadService.uploadFile({
        companyId: input.companyId,
        reservationId: input.reservationId,
        file,
        type: input.type,
      });
      uploadedPhotos.push(result);
    }

    return {
      reservationId: input.reservationId,
      uploadedPhotos,
      totalUploaded: uploadedPhotos.length,
    };
  }
}
