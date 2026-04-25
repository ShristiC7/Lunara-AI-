import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from './logger';

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
  },
  endpoint: process.env.S3_ENDPOINT, // For Minio/LocalStack
  forcePathStyle: !!process.env.S3_ENDPOINT,
});

const BUCKET_NAME = process.env.S3_BUCKET || 'lunara-reports';

export class StorageService {
  static async upload(key: string, body: Buffer, contentType: string = 'application/pdf'): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
      });

      await s3Client.send(command);
      logger.info('File uploaded to S3', { key });
      return key;
    } catch (error: any) {
      logger.error('S3 Upload Failed', { key, error: error.message });
      throw error;
    }
  }

  static async getDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn });
      return url;
    } catch (error: any) {
      logger.error('Failed to generate pre-signed URL', { key, error: error.message });
      throw error;
    }
  }
}
