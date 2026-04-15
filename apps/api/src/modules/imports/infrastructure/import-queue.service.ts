import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Job, Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { ImportProcessorService } from "../application/import-processor.service";

@Injectable()
export class ImportQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ImportQueueService.name);
  private connection?: IORedis;
  private queue?: Queue;
  private worker?: Worker;
  private enabled = false;

  constructor(private readonly importProcessorService: ImportProcessorService) {}

  async onModuleInit() {
    try {
      this.connection = new IORedis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379", {
        maxRetriesPerRequest: null,
      });
      this.queue = new Queue("imports", { connection: this.connection });

      if ((process.env.IMPORT_WORKER_ENABLED ?? "true") === "true") {
        this.worker = new Worker(
          "imports",
          async (job: Job<{ jobId: string }>) => {
            await this.importProcessorService.execute(job.data.jobId);
          },
          { connection: this.connection },
        );
      }

      this.enabled = true;
    } catch (error) {
      this.logger.warn(`BullMQ deshabilitado, fallback sin cola: ${String(error)}`);
      this.enabled = false;
    }
  }

  async enqueueImport(jobId: string) {
    if (this.enabled && this.queue) {
      await this.queue.add("confirm", { jobId }, { removeOnComplete: 100, removeOnFail: 100 });
      return { queued: true };
    }

    await this.importProcessorService.execute(jobId);
    return { queued: false };
  }

  async onModuleDestroy() {
    await this.worker?.close();
    await this.queue?.close();
    await this.connection?.quit();
  }
}
