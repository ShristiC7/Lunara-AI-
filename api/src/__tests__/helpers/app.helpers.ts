import request from 'supertest';
import { createApp } from '../../app';

export const testApp = createApp();
export { request };
