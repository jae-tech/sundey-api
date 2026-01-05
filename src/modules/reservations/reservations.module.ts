import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomersModule } from '@modules/customers/customers.module';
import { ServicesModule } from '@modules/services/services.module';
import { RESERVATION_REPOSITORY, JOB_REPOSITORY, RESERVATION_STATUS_LOG_REPOSITORY } from '@core/ports/tokens';
import { PrismaReservationAdapter } from './infrastructure/prisma-reservation.adapter';
import { PrismaJobAdapter } from './infrastructure/prisma-job.adapter';
import { PrismaReservationStatusLogAdapter } from './infrastructure/prisma-reservation-status-log.adapter';
import { FileUploadService } from './infrastructure/file-upload.service';
import { PresignedUrlService } from './infrastructure/presigned-url.service';
import { CreateReservationUseCase } from './application/create-reservation.usecase';
import { ConfirmReservationUseCase } from './application/confirm-reservation.usecase';
import { AssignUserUseCase } from './application/assign-user.usecase';
import { UpdateReservationStatusUseCase } from './application/update-status.usecase';
import { MarkReservationPaidUseCase } from './application/mark-paid.usecase';
import { GetUnpaidReservationsUseCase } from './application/get-unpaid-reservations.usecase';
import { UploadPhotosUseCase } from './application/upload-photos.usecase';
import { GeneratePresignedUrlUseCase } from './application/generate-presigned-url.usecase';
import { SaveJobPhotosUseCase } from './application/save-job-photos.usecase';
import { GetReservationStatusLogsUseCase } from './application/get-reservation-status-logs.usecase';
import { CleanupOrphanPhotosJob } from './application/cleanup-orphan-photos.job';
import { ReservationController } from './interface/reservation.controller';
import { ReservationGateway } from './interface/reservation.gateway';

@Module({
  imports: [ConfigModule, CustomersModule, ServicesModule],
  controllers: [ReservationController],
  providers: [
    {
      provide: RESERVATION_REPOSITORY,
      useClass: PrismaReservationAdapter,
    },
    {
      provide: JOB_REPOSITORY,
      useClass: PrismaJobAdapter,
    },
    {
      provide: RESERVATION_STATUS_LOG_REPOSITORY,
      useClass: PrismaReservationStatusLogAdapter,
    },
    ReservationGateway,
    FileUploadService,
    PresignedUrlService,
    CreateReservationUseCase,
    ConfirmReservationUseCase,
    AssignUserUseCase,
    UpdateReservationStatusUseCase,
    MarkReservationPaidUseCase,
    GetUnpaidReservationsUseCase,
    UploadPhotosUseCase,
    GeneratePresignedUrlUseCase,
    SaveJobPhotosUseCase,
    GetReservationStatusLogsUseCase,
    // CleanupOrphanPhotosJob,
  ],
  exports: [RESERVATION_REPOSITORY, ReservationGateway],
})
export class ReservationsModule {}
