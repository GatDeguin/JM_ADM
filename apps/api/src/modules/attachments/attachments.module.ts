import { Module } from "@nestjs/common";
import { AttachmentsService } from "./application/attachments.service";
import { AttachmentsRepository } from "./infrastructure/attachments.repository";
import { ObjectStorageService } from "./infrastructure/object-storage.service";
import { AttachmentsController } from "./presentation/attachments.controller";

@Module({
  controllers: [AttachmentsController],
  providers: [AttachmentsService, AttachmentsRepository, ObjectStorageService],
})
export class AttachmentsModule {}
