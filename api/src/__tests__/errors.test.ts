import { AppError, asyncHandler } from '../../utils/errors';
import { Request, Response, NextFunction } from 'express';

describe('AppError', () => {
  it('creates error with correct properties', () => {
    const err = new AppError('Not found', 404, 'NOT_FOUND');
    expect(err.message).toBe('Not found');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.isOperational).toBe(true);
  });

  it('uses default code when not provided', () => {
    const err = new AppError('Bad request', 400);
    expect(err.code).toBe('BAD_REQUEST');
  });

  it('is instanceof Error', () => {
    const err = new AppError('Test', 500);
    expect(err instanceof Error).toBe(true);
  });
});

describe('asyncHandler', () => {
  it('passes errors to next', async () => {
    const mockNext = jest.fn();
    const error = new AppError('Test error', 400);
    const handler = asyncHandler(async () => { throw error; });
    await handler({} as Request, {} as Response, mockNext as NextFunction);
    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
