import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Server, Socket } from 'socket.io';
import { ReservationGateway } from './reservation.gateway';

describe('ReservationGateway', () => {
  let gateway: ReservationGateway;
  let mockServer: any;
  let mockClient: any;

  beforeEach(() => {
    // Mock Socket.IO Server
    mockServer = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };

    gateway = new ReservationGateway();
    gateway.server = mockServer;

    // Mock Socket client
    mockClient = {
      id: 'socket-123',
      join: vi.fn(),
      leave: vi.fn(),
    };
  });

  describe('handleConnection', () => {
    it('should handle client connection', () => {
      gateway.handleConnection(mockClient);
      expect(mockClient.id).toBe('socket-123');
    });

    it('should log connection message', () => {
      const logSpy = vi.spyOn(gateway['logger'], 'log');
      gateway.handleConnection(mockClient);
      expect(logSpy).toHaveBeenCalledWith(`클라이언트 연결됨: socket-123`);
    });

    it('should handle multiple client connections', () => {
      const client1 = { id: 'socket-1', join: vi.fn(), leave: vi.fn() };
      const client2 = { id: 'socket-2', join: vi.fn(), leave: vi.fn() };

      gateway.handleConnection(client1);
      gateway.handleConnection(client2);

      expect(client1.id).toBe('socket-1');
      expect(client2.id).toBe('socket-2');
    });
  });

  describe('handleDisconnect', () => {
    it('should handle client disconnection', () => {
      gateway.handleDisconnect(mockClient);
      expect(mockClient.id).toBe('socket-123');
    });

    it('should log disconnection message', () => {
      const logSpy = vi.spyOn(gateway['logger'], 'log');
      gateway.handleDisconnect(mockClient);
      expect(logSpy).toHaveBeenCalledWith(`클라이언트 연결 해제됨: socket-123`);
    });
  });

  describe('handleJoinCompany', () => {
    it('should join client to company room', () => {
      const result = gateway.handleJoinCompany(mockClient, {
        companyId: 'company-123',
      });

      expect(mockClient.join).toHaveBeenCalledWith('company:company-123');
      expect(result).toEqual({ success: true, room: 'company:company-123' });
    });

    it('should log join message', () => {
      const logSpy = vi.spyOn(gateway['logger'], 'log');
      gateway.handleJoinCompany(mockClient, { companyId: 'company-123' });
      expect(logSpy).toHaveBeenCalledWith(
        `클라이언트 socket-123 방 입장: company:company-123`,
      );
    });

    it('should return success response', () => {
      const result = gateway.handleJoinCompany(mockClient, {
        companyId: 'company-456',
      });

      expect(result.success).toBe(true);
      expect(result.room).toBe('company:company-456');
    });

    it('should handle multiple company joins', () => {
      const room1 = gateway.handleJoinCompany(mockClient, {
        companyId: 'company-1',
      });
      const room2 = gateway.handleJoinCompany(mockClient, {
        companyId: 'company-2',
      });

      expect(room1.room).toBe('company:company-1');
      expect(room2.room).toBe('company:company-2');
      expect(mockClient.join).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleLeaveCompany', () => {
    it('should leave client from company room', () => {
      const result = gateway.handleLeaveCompany(mockClient, {
        companyId: 'company-123',
      });

      expect(mockClient.leave).toHaveBeenCalledWith('company:company-123');
      expect(result).toEqual({ success: true });
    });

    it('should log leave message', () => {
      const logSpy = vi.spyOn(gateway['logger'], 'log');
      gateway.handleLeaveCompany(mockClient, { companyId: 'company-123' });
      expect(logSpy).toHaveBeenCalledWith(
        `클라이언트 socket-123 방 퇴장: company:company-123`,
      );
    });

    it('should return success response', () => {
      const result = gateway.handleLeaveCompany(mockClient, {
        companyId: 'company-456',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('broadcastReservationUpdate', () => {
    it('should broadcast update to company room', () => {
      const data = { reservationId: 'res-123', status: 'CONFIRMED' };

      gateway.broadcastReservationUpdate('company-123', 'statusChanged', data);

      expect(mockServer.to).toHaveBeenCalledWith('company:company-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'reservation:statusChanged',
        data,
      );
    });

    it('should broadcast with correct event name', () => {
      gateway.broadcastReservationUpdate('company-1', 'created', {});

      expect(mockServer.emit).toHaveBeenCalledWith('reservation:created', {});
    });

    it('should include event data in broadcast', () => {
      const complexData = {
        id: '123',
        name: 'Test',
        nested: { field: 'value' },
      };

      gateway.broadcastReservationUpdate('company-1', 'updated', complexData);

      expect(mockServer.emit).toHaveBeenCalledWith(
        'reservation:updated',
        complexData,
      );
    });

    it('should log broadcast', () => {
      const debugSpy = vi.spyOn(gateway['logger'], 'debug');
      gateway.broadcastReservationUpdate('company-123', 'created', {});

      expect(debugSpy).toHaveBeenCalledWith(
        `브로드캐스트 company:company-123: reservation:created`,
      );
    });
  });

  describe('broadcastReservationCreated', () => {
    it('should broadcast reservation created event', () => {
      const reservation = { id: 'res-123', status: 'PENDING_INQUIRY' };

      gateway.broadcastReservationCreated('company-123', reservation);

      expect(mockServer.to).toHaveBeenCalledWith('company:company-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'reservation:created',
        reservation,
      );
    });
  });

  describe('broadcastReservationStatusChanged', () => {
    it('should broadcast status changed event', () => {
      const reservation = { id: 'res-123', status: 'CONFIRMED' };

      gateway.broadcastReservationStatusChanged('company-123', reservation);

      expect(mockServer.to).toHaveBeenCalledWith('company:company-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'reservation:statusChanged',
        reservation,
      );
    });
  });

  describe('broadcastReservationPaymentUpdated', () => {
    it('should broadcast payment updated event', () => {
      const reservation = { id: 'res-123', paidAmount: 50000 };

      gateway.broadcastReservationPaymentUpdated('company-123', reservation);

      expect(mockServer.to).toHaveBeenCalledWith('company:company-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'reservation:paymentUpdated',
        reservation,
      );
    });
  });

  describe('broadcastReservationAssigned', () => {
    it('should broadcast assigned event', () => {
      const reservation = { id: 'res-123', assignedUserId: 'user-456' };

      gateway.broadcastReservationAssigned('company-123', reservation);

      expect(mockServer.to).toHaveBeenCalledWith('company:company-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'reservation:assigned',
        reservation,
      );
    });
  });

  describe('broadcastPhotosUploaded', () => {
    it('should broadcast photos uploaded event', () => {
      const data = {
        reservationId: 'res-123',
        jobId: 'job-456',
        photos: [
          {
            id: 'photo-1',
            type: 'before',
            photoUrl: 'http://example.com/photo1.jpg',
            fileName: 'photo1.jpg',
            uploadedAt: new Date(),
          },
        ],
      };

      gateway.broadcastPhotosUploaded('company-123', data);

      expect(mockServer.to).toHaveBeenCalledWith('company:company-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'reservation:photosUploaded',
        data,
      );
    });

    it('should handle multiple photos', () => {
      const data = {
        reservationId: 'res-123',
        jobId: 'job-456',
        photos: [
          {
            id: 'photo-1',
            type: 'before',
            photoUrl: 'http://example.com/photo1.jpg',
            fileName: 'photo1.jpg',
            uploadedAt: new Date(),
          },
          {
            id: 'photo-2',
            type: 'before',
            photoUrl: 'http://example.com/photo2.jpg',
            fileName: 'photo2.jpg',
            uploadedAt: new Date(),
          },
        ],
      };

      gateway.broadcastPhotosUploaded('company-123', data);

      expect(mockServer.emit).toHaveBeenCalledWith(
        'reservation:photosUploaded',
        expect.objectContaining({
          photos: expect.arrayContaining([
            expect.objectContaining({ id: 'photo-1' }),
            expect.objectContaining({ id: 'photo-2' }),
          ]),
        }),
      );
    });
  });

  describe('broadcastPhotosSaved', () => {
    it('should broadcast photos saved event', () => {
      const data = {
        reservationId: 'res-123',
        jobId: 'job-456',
        savedPhotos: [
          {
            id: 'photo-1',
            type: 'before',
            photoUrl: 'http://example.com/photo1.jpg',
            fileName: 'photo1.jpg',
            uploadedAt: new Date(),
          },
        ],
      };

      gateway.broadcastPhotosSaved('company-123', data);

      expect(mockServer.to).toHaveBeenCalledWith('company:company-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'reservation:photosSaved',
        data,
      );
    });
  });

  describe('room management', () => {
    it('should use correct room naming convention', () => {
      const companyId = 'my-company-123';
      gateway.handleJoinCompany(mockClient, { companyId });

      expect(mockClient.join).toHaveBeenCalledWith(`company:${companyId}`);
    });

    it('should broadcast to correct room format', () => {
      const companyId = 'test-company';
      gateway.broadcastReservationCreated(companyId, {});

      expect(mockServer.to).toHaveBeenCalledWith(`company:${companyId}`);
    });
  });
});
