import { Injectable } from "@nestjs/common";
import { AttachmentsRepository } from "../infrastructure/attachments.repository";
import { ObjectStorageService } from "../infrastructure/object-storage.service";

export type CreateAttachmentInput = {
  entityType: string;
  entityId: string;
  originalName: string;
  mimeType: string;
  size: number;
  metadata?: Record<string, unknown>;
  buffer: Buffer;
};

@Injectable()
export class AttachmentsService {
  constructor(
    private readonly storageService: ObjectStorageService,
    private readonly attachmentsRepository: AttachmentsRepository,
  ) {}

  async upload(input: CreateAttachmentInput) {
    const objectKey = `${input.entityType}/${input.entityId}/${Date.now()}-${input.originalName}`;
    const uploadResult = await this.storageService.uploadObject({
      key: objectKey,
      body: input.buffer,
      contentType: input.mimeType,
    });

    return this.attachmentsRepository.create({
      entityType: input.entityType,
      entityId: input.entityId,
      fileName: input.originalName,
      mimeType: input.mimeType,
      size: input.size,
      bucket: uploadResult.bucket,
      objectKey,
      etag: uploadResult.etag,
      url: uploadResult.url,
      status: "uploaded",
      metadata: input.metadata,
    });
  }
}
