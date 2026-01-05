import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  HttpException,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockHost: any;
  let mockReply: any;
  let mockContext: any;

  beforeEach(() => {
    filter = new HttpExceptionFilter();

    // Mock Fastify Reply
    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    // Mock Context
    mockContext = {
      switchToHttp: vi.fn().mockReturnValue({
        getResponse: vi.fn().mockReturnValue(mockReply),
      }),
    };

    // Mock ArgumentsHost
    mockHost = {
      switchToHttp: vi.fn().mockReturnValue({
        getResponse: vi.fn().mockReturnValue(mockReply),
      }),
    };
  });

  describe('catch - HttpException handling', () => {
    it('should catch HttpException and send appropriate response', () => {
      const exception = new BadRequestException('Invalid request');

      filter.catch(exception, mockHost);

      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid request',
        }),
      );
    });

    it('should include timestamp in response', () => {
      const exception = new BadRequestException('Invalid request');

      filter.catch(exception, mockHost);

      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
        }),
      );
    });

    it('should handle 404 Not Found exception', () => {
      const exception = new NotFoundException('Resource not found');

      filter.catch(exception, mockHost);

      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Resource not found',
        }),
      );
    });

    it('should handle 401 Unauthorized exception', () => {
      const exception = new UnauthorizedException('Unauthorized access');

      filter.catch(exception, mockHost);

      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized access',
        }),
      );
    });

    it('should handle 403 Forbidden exception', () => {
      const exception = new ForbiddenException('Forbidden resource');

      filter.catch(exception, mockHost);

      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Forbidden resource',
        }),
      );
    });

    it('should extract message from object response', () => {
      const exception = new HttpException(
        { message: 'Validation error', errors: [] },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation error',
        }),
      );
    });

    it('should handle nested error message object', () => {
      const exception = new HttpException(
        {
          error: 'Not Found',
          message: 'User not found',
          statusCode: 404,
        },
        HttpStatus.NOT_FOUND,
      );

      filter.catch(exception, mockHost);

      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found',
        }),
      );
    });
  });

  describe('catch - Non-HttpException handling', () => {
    it('should handle non-HttpException errors', () => {
      const error = new Error('Unexpected error');

      filter.catch(error, mockHost);

      expect(mockReply.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        }),
      );
    });

    it('should handle thrown strings', () => {
      const error = 'String error message';

      filter.catch(error, mockHost);

      expect(mockReply.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        }),
      );
    });

    it('should handle thrown objects without message property', () => {
      const error = { code: 'UNKNOWN_ERROR', details: 'Some details' };

      filter.catch(error, mockHost);

      expect(mockReply.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Internal server error',
        }),
      );
    });

    it('should handle null exception', () => {
      filter.catch(null, mockHost);

      expect(mockReply.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Internal server error',
        }),
      );
    });

    it('should handle undefined exception', () => {
      filter.catch(undefined, mockHost);

      expect(mockReply.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });
  });

  describe('message extraction', () => {
    it('should extract string message from HttpException', () => {
      const exception = new BadRequestException('String message');

      filter.catch(exception, mockHost);

      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'String message',
        }),
      );
    });

    it('should extract message from object response', () => {
      const exception = new HttpException(
        { message: 'Object message' },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Object message',
        }),
      );
    });

    it('should handle empty message string', () => {
      const exception = new BadRequestException('');

      filter.catch(exception, mockHost);

      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          // BadRequestException('')은 기본 메시지 'Bad Request'를 반환
          message: 'Bad Request',
        }),
      );
    });

    it('should convert non-string message to string', () => {
      const exception = new HttpException(
        { message: 123 },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '123',
        }),
      );
    });
  });

  describe('response structure', () => {
    it('should include statusCode in response', () => {
      const exception = new BadRequestException('Test');

      filter.catch(exception, mockHost);

      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: expect.any(Number),
        }),
      );
    });

    it('should include timestamp in ISO format', () => {
      const exception = new BadRequestException('Test');

      filter.catch(exception, mockHost);

      const call = mockReply.send.mock.calls[0][0];
      const timestamp = new Date(call.timestamp);

      expect(timestamp instanceof Date).toBe(true);
      expect(!isNaN(timestamp.getTime())).toBe(true);
    });

    it('should call reply.status with correct status code', () => {
      const exception = new HttpException('Error', HttpStatus.CONFLICT);

      filter.catch(exception, mockHost);

      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    });

    it('should chain status and send methods', () => {
      const exception = new BadRequestException('Test');

      filter.catch(exception, mockHost);

      expect(mockReply.status).toHaveBeenCalled();
      expect(mockReply.send).toHaveBeenCalled();
    });
  });

  describe('logging', () => {
    it('should log exceptions with error method', () => {
      const exception = new BadRequestException('Test error');
      const errorSpy = vi.spyOn(filter['logger'], 'error');

      filter.catch(exception, mockHost);

      expect(errorSpy).toHaveBeenCalled();
      const call = errorSpy.mock.calls[0];
      expect(call[0]).toContain('예외 발생');
    });

    it('should log exception details', () => {
      const exception = new BadRequestException('Specific error');
      const errorSpy = vi.spyOn(filter['logger'], 'error');

      filter.catch(exception, mockHost);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.anything(),
      );
    });
  });

  describe('HTTP status codes', () => {
    it('should handle 400 Bad Request', () => {
      const exception = new BadRequestException('Bad request');
      filter.catch(exception, mockHost);
      expect(mockReply.status).toHaveBeenCalledWith(400);
    });

    it('should handle 401 Unauthorized', () => {
      const exception = new UnauthorizedException('Unauthorized');
      filter.catch(exception, mockHost);
      expect(mockReply.status).toHaveBeenCalledWith(401);
    });

    it('should handle 403 Forbidden', () => {
      const exception = new ForbiddenException('Forbidden');
      filter.catch(exception, mockHost);
      expect(mockReply.status).toHaveBeenCalledWith(403);
    });

    it('should handle 404 Not Found', () => {
      const exception = new NotFoundException('Not found');
      filter.catch(exception, mockHost);
      expect(mockReply.status).toHaveBeenCalledWith(404);
    });

    it('should handle 500 Internal Server Error', () => {
      const exception = new InternalServerErrorException('Server error');
      filter.catch(exception, mockHost);
      expect(mockReply.status).toHaveBeenCalledWith(500);
    });

    it('should handle custom status code', () => {
      const exception = new HttpException(
        'Custom error',
        HttpStatus.I_AM_A_TEAPOT,
      );
      filter.catch(exception, mockHost);
      expect(mockReply.status).toHaveBeenCalledWith(
        HttpStatus.I_AM_A_TEAPOT,
      );
    });
  });

  describe('edge cases', () => {
    it('should handle exception with null response', () => {
      const exception = new HttpException(null, HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost);

      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockReply.send).toHaveBeenCalled();
    });

    it('should handle very long error message', () => {
      const longMessage = 'a'.repeat(10000);
      const exception = new BadRequestException(longMessage);

      filter.catch(exception, mockHost);

      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: longMessage,
        }),
      );
    });

    it('should handle special characters in message', () => {
      const specialMessage = '에러: 한글, 특수문자 !@#$%';
      const exception = new BadRequestException(specialMessage);

      filter.catch(exception, mockHost);

      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: specialMessage,
        }),
      );
    });
  });
});
