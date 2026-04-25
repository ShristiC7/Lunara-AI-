export const prisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  refreshToken: {
    findFirst: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  $disconnect: jest.fn(),
} as any;
