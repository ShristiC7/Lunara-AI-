import request from 'supertest';
jest.mock('../../lib/prisma');
import { createApp } from '../../app';

export const testApp = createApp();
export { request };
