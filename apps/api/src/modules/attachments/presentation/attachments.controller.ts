import { BadRequestException, Body, Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { z } from "zod";
import { AttachmentsService } from "../application/attachments.service";

const bodySchema = z.object({
  entityType: z.string().min(2),
  entityId: z.string().min(1),
  metadata: z.string().optional(),
});

@Controller("attachments")
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async upload(@UploadedFile() file: { originalname: string; mimetype: string; size: number; buffer: Buffer }, @Body() body: Record<string, unknown>) {
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }
    if (!file) {
      throw new BadRequestException("Archivo requerido");
    }

    const metadata = parsed.data.metadata ? ((JSON.parse(parsed.data.metadata) as Record<string, unknown>) ?? undefined) : undefined;

    return this.attachmentsService.upload({
      entityType: parsed.data.entityType,
      entityId: parsed.data.entityId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      metadata,
      buffer: file.buffer,
    });
  }
}
