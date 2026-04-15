import { Injectable } from "@nestjs/common";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

@Injectable()
export class ObjectStorageService {
  private readonly bucket = process.env.STORAGE_BUCKET ?? "attachments";
  private readonly publicBaseUrl = process.env.STORAGE_PUBLIC_BASE_URL;

  private readonly s3 = new S3Client({
    region: process.env.STORAGE_REGION ?? "us-east-1",
    endpoint: process.env.STORAGE_ENDPOINT,
    forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === "true",
    credentials:
      process.env.STORAGE_ACCESS_KEY && process.env.STORAGE_SECRET_KEY
        ? {
            accessKeyId: process.env.STORAGE_ACCESS_KEY,
            secretAccessKey: process.env.STORAGE_SECRET_KEY,
          }
        : undefined,
  });

  async uploadObject(input: { key: string; body: Buffer; contentType: string }) {
    const result = await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
      }),
    );

    const url = this.publicBaseUrl
      ? `${this.publicBaseUrl.replace(/\/$/, "")}/${input.key}`
      : `${process.env.STORAGE_ENDPOINT?.replace(/\/$/, "")}/${this.bucket}/${input.key}`;

    return {
      bucket: this.bucket,
      etag: result.ETag ?? null,
      url,
    };
  }
}
