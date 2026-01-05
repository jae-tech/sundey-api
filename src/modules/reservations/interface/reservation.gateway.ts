import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  Logger as WsLogger,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

/**
 * WebSocket 게이트웨이 - 예약 변경사항을 실시간으로 브로드캐스트
 * 클라이언트는 특정 회사(companyId)의 채널에 참여하여 실시간 업데이트를 받음
 */
@WebSocketGateway({
  cors: {
    origin: '*', // 프로덕션에서는 환경변수로 제어
    methods: ['GET', 'POST'],
  },
  namespace: 'reservations',
})
@Injectable()
export class ReservationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ReservationGateway.name);

  /**
   * 클라이언트 연결 시
   */
  handleConnection(client: Socket) {
    this.logger.log(`클라이언트 연결됨: ${client.id}`);
  }

  /**
   * 클라이언트 연결 해제 시
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`클라이언트 연결 해제됨: ${client.id}`);
  }

  /**
   * 클라이언트가 특정 회사 채널에 참여
   * @example
   * socket.emit('joinCompany', { companyId: '123' })
   */
  @SubscribeMessage('joinCompany')
  handleJoinCompany(client: Socket, data: { companyId: string }) {
    const room = `company:${data.companyId}`;
    client.join(room);
    this.logger.log(`클라이언트 ${client.id} 방 입장: ${room}`);
    return { success: true, room };
  }

  /**
   * 클라이언트가 회사 채널에서 나감
   */
  @SubscribeMessage('leaveCompany')
  handleLeaveCompany(client: Socket, data: { companyId: string }) {
    const room = `company:${data.companyId}`;
    client.leave(room);
    this.logger.log(`클라이언트 ${client.id} 방 퇴장: ${room}`);
    return { success: true };
  }

  /**
   * 예약 변경사항을 특정 회사 채널에 브로드캐스트
   * @internal 내부 메서드 - 백엔드에서만 호출
   */
  broadcastReservationUpdate(companyId: string, event: string, data: any) {
    const room = `company:${companyId}`;
    this.server.to(room).emit(`reservation:${event}`, data);
    this.logger.debug(`브로드캐스트 ${room}: reservation:${event}`);
  }

  /**
   * 예약 생성 브로드캐스트
   */
  broadcastReservationCreated(companyId: string, reservation: any) {
    this.broadcastReservationUpdate(companyId, 'created', reservation);
  }

  /**
   * 예약 상태 변경 브로드캐스트
   */
  broadcastReservationStatusChanged(companyId: string, reservation: any) {
    this.broadcastReservationUpdate(companyId, 'statusChanged', reservation);
  }

  /**
   * 예약 금액 변경 브로드캐스트
   */
  broadcastReservationPaymentUpdated(companyId: string, reservation: any) {
    this.broadcastReservationUpdate(companyId, 'paymentUpdated', reservation);
  }

  /**
   * 예약 담당자 배정 브로드캐스트
   */
  broadcastReservationAssigned(companyId: string, reservation: any) {
    this.broadcastReservationUpdate(companyId, 'assigned', reservation);
  }

  /**
   * 청소 사진 업로드 브로드캐스트
   */
  broadcastPhotosUploaded(
    companyId: string,
    data: {
      reservationId: string;
      jobId: string;
      photos: Array<{
        id: string;
        type: string;
        photoUrl: string;
        fileName: string;
        uploadedAt: Date;
      }>;
    },
  ) {
    this.broadcastReservationUpdate(companyId, 'photosUploaded', data);
  }

  /**
   * 청소 사진 메타데이터 저장 브로드캐스트
   */
  broadcastPhotosSaved(
    companyId: string,
    data: {
      reservationId: string;
      jobId: string;
      savedPhotos: Array<{
        id: string;
        type: string;
        photoUrl: string;
        fileName: string;
        uploadedAt: Date;
      }>;
    },
  ) {
    this.broadcastReservationUpdate(companyId, 'photosSaved', data);
  }
}
