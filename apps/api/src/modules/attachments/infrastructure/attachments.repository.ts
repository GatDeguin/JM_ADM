import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";

@Injectable()
export class AttachmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: {
    entityType: string;
    entityId: string;
    fileName: string;
    mimeType: string;
    size: number;
    bucket: string;
    objectKey: string;
    etag: string | null;
    url: string;
    status: string;
    metadata?: Record<string, unknown>;
  }) {
    return (this.prisma as any).attachment.create({
      data: {
        entityType: input.entityType,
        entityId: input.entityId,
        fileName: input.fileName,
        mimeType: input.mimeType,
        size: input.size,
        bucket: input.bucket,
        objectKey: input.objectKey,
        etag: input.etag,
        url: input.url,
        status: input.status,
        metadata: input.metadata,
      },
    });
  }
}
