import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CreateReservationUseCase } from '../application/create-reservation.usecase';
import { ConfirmReservationUseCase } from '../application/confirm-reservation.usecase';
import { AssignUserUseCase } from '../application/assign-user.usecase';
import { UpdateReservationStatusUseCase } from '../application/update-status.usecase';
import { MarkReservationPaidUseCase } from '../application/mark-paid.usecase';
import { GetUnpaidReservationsUseCase } from '../application/get-unpaid-reservations.usecase';
import { UploadPhotosUseCase } from '../application/upload-photos.usecase';
import { GeneratePresignedUrlUseCase } from '../application/generate-presigned-url.usecase';
import { SaveJobPhotosUseCase } from '../application/save-job-photos.usecase';
import { GetReservationStatusLogsUseCase } from '../application/get-reservation-status-logs.usecase';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { AssignUserDto } from './dto/assign-user.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { GeneratePresignedUrlDto } from './dto/generate-presigned-url.dto';
import { SaveJobPhotosDto } from './dto/save-job-photos.dto';

@ApiTags('예약')
@ApiBearerAuth('JWT')
@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationController {
  constructor(
    private readonly createReservationUseCase: CreateReservationUseCase,
    private readonly confirmReservationUseCase: ConfirmReservationUseCase,
    private readonly assignUserUseCase: AssignUserUseCase,
    private readonly updateStatusUseCase: UpdateReservationStatusUseCase,
    private readonly markPaidUseCase: MarkReservationPaidUseCase,
    private readonly getUnpaidUseCase: GetUnpaidReservationsUseCase,
    private readonly uploadPhotosUseCase: UploadPhotosUseCase,
    private readonly generatePresignedUrlUseCase: GeneratePresignedUrlUseCase,
    private readonly saveJobPhotosUseCase: SaveJobPhotosUseCase,
    private readonly getStatusLogsUseCase: GetReservationStatusLogsUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: '예약 생성',
    description: '새로운 예약을 생성합니다.',
  })
  async createReservation(@Body() dto: CreateReservationDto) {
    return this.createReservationUseCase.execute(dto);
  }

  @Post(':id/confirm')
  @ApiOperation({
    summary: '예약 확정',
    description: '예약을 확정하고 고객을 자동 생성합니다.',
  })
  async confirmReservation(@Param('id') id: string) {
    return this.confirmReservationUseCase.execute({ reservationId: id });
  }

  @Patch(':id/assign')
  @ApiOperation({
    summary: '담당자 배정',
    description: '예약에 담당 직원을 배정합니다.',
  })
  async assignUser(@Param('id') id: string, @Body() dto: AssignUserDto) {
    return this.assignUserUseCase.execute({
      reservationId: id,
      assignedUserId: dto.assignedUserId,
    });
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: '예약 상태 변경',
    description: '예약 상태를 변경합니다. (대기 중 → 확정 → 진행 중 → 완료)',
  })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    // TODO: RequestUser 데코레이터에서 userId 추출
    const userId = 'temp-user-id';
    return this.updateStatusUseCase.execute({
      reservationId: id,
      status: dto.status,
      userId,
      reason: dto.reason,
    });
  }

  @Get(':id/status-logs')
  @ApiOperation({
    summary: '상태 변경 이력 조회',
    description: '예약의 모든 상태 변경 이력을 시간 순서로 조회합니다.',
  })
  async getStatusLogs(
    @Param('id') id: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.getStatusLogsUseCase.execute({
      reservationId: id,
      skip: skip ? parseInt(skip, 10) : 0,
      take: take ? parseInt(take, 10) : 20,
    });
  }

  @Post(':id/payment')
  @ApiOperation({
    summary: '결제 처리',
    description: '예약에 대한 결제를 처리합니다. (부분 결제 또는 전액 결제)',
  })
  async markPaid(@Param('id') id: string, @Body() dto: MarkPaidDto) {
    return this.markPaidUseCase.execute({
      reservationId: id,
      paidAmount: dto.paidAmount,
      paymentNote: dto.paymentNote,
    });
  }

  @Get('unpaid/company/:companyId')
  @ApiOperation({
    summary: '미결제 예약 조회',
    description: '특정 회사의 미결제 예약 목록을 조회합니다.',
  })
  async getUnpaid(@Param('companyId') companyId: string) {
    return this.getUnpaidUseCase.execute({ companyId });
  }

  @Post(':id/photos/presigned-url/:type')
  @ApiOperation({
    summary: '청소 사진 업로드 - 프리사인 URL 생성',
    description:
      '청소 사진 업로드를 위한 프리사인된 URL을 생성합니다. 이 URL을 사용하여 프론트에서 직접 파일을 업로드할 수 있습니다.',
  })
  async generatePresignedUrl(
    @Param('id') reservationId: string,
    @Param('type') type: 'before' | 'after',
    @Body() dto: GeneratePresignedUrlDto,
  ) {
    if (type !== 'before' && type !== 'after') {
      throw new BadRequestException('Type must be "before" or "after"');
    }

    // TODO: 실제 구현 시 RequestUser 데코레이터에서 companyId 추출
    const companyId = 'temp-company-id'; // 임시 처리

    return this.generatePresignedUrlUseCase.execute({
      companyId,
      reservationId,
      fileName: dto.fileName,
      mimeType: dto.mimeType,
      type,
    });
  }

  @Post(':id/photos/confirm')
  @ApiOperation({
    summary: '청소 사진 메타데이터 저장',
    description:
      '프리사인 URL로 업로드된 사진의 메타데이터를 저장합니다.',
  })
  async saveJobPhotos(
    @Param('id') reservationId: string,
    @Body() dto: SaveJobPhotosDto,
  ) {
    // TODO: 실제 구현 시 RequestUser 데코레이터에서 companyId 추출
    const companyId = 'temp-company-id'; // 임시 처리

    return this.saveJobPhotosUseCase.execute({
      companyId,
      reservationId: dto.reservationId || reservationId,
      photos: dto.photos,
    });
  }

  @Post(':id/photos/:type')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '청소 사진 업로드 (deprecated)',
    description:
      '청소 전(before) 또는 청소 후(after) 사진을 업로드합니다. 프리사인 URL 엔드포인트 사용을 권장합니다.',
    deprecated: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['files'],
    },
  })
  async uploadPhotos(
    @Param('id') reservationId: string,
    @Param('type') type: 'before' | 'after',
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (type !== 'before' && type !== 'after') {
      throw new BadRequestException('Type must be "before" or "after"');
    }

    // TODO: 실제 구현 시 RequestUser 데코레이터에서 companyId 추출
    const companyId = 'temp-company-id'; // 임시 처리

    return this.uploadPhotosUseCase.execute({
      reservationId,
      companyId,
      files,
      type,
    });
  }
}
