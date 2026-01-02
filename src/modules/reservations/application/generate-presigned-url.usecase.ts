import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IUseCase } from '@core/base.usecase';
import { RESERVATION_REPOSITORY } from '@core/ports/tokens';
import { IReservationRepository } from '@core/ports/reservation.repository.port';
import { PresignedUrlService } from '../infrastructure/presigned-url.service';

export interface GeneratePresignedUrlInput {
  companyId: string;
  reservationId: string;
  fileName: string;
  mimeType: string;
  type: 'before' | 'after';
}

export interface GeneratePresignedUrlOutput {
  presignedUrl: string;
  objectName: string;
  bucket: string;
  expiresIn: number;
}

@Injectable()
export class GeneratePresignedUrlUseCase implements IUseCase<
  GeneratePresignedUrlInput,
  GeneratePresignedUrlOutput
> {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    private readonly presignedUrlService: PresignedUrlService,
  ) {}

  async execute(
    input: GeneratePresignedUrlInput,
  ): Promise<GeneratePresignedUrlOutput> {
    // 예약 존재 여부 확인
    const reservation = await this.reservationRepository.findById(
      input.reservationId,
    );

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // 회사 소유권 확인
    if (reservation.companyId !== input.companyId) {
      throw new BadRequestException(
        'Reservation does not belong to this company',
      );
    }

    // 파일 이름 검증
    if (!input.fileName || input.fileName.trim() === '') {
      throw new BadRequestException('File name is required');
    }

    // MIME 타입 검증 (이미지만 허용)
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
    ];

    if (!allowedMimeTypes.includes(input.mimeType)) {
      throw new BadRequestException(
        'Only image files are allowed (jpeg, png, webp, heic)',
      );
    }

    // 타입 검증
    if (input.type !== 'before' && input.type !== 'after') {
      throw new BadRequestException('Type must be "before" or "after"');
    }

    // 프리사인 URL 생성
    const result = await this.presignedUrlService.generatePresignedUrl({
      companyId: input.companyId,
      reservationId: input.reservationId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      type: input.type,
    });

    return {
      ...result,
      expiresIn: 3600, // 1시간
    };
  }
}
