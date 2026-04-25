import request from 'supertest';
import { createApp } from '../../app';
import { prisma } from '../../lib/prisma';

export const testApp = createApp();
export { request, prisma };
