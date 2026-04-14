import { Injectable } from "@nestjs/common";
import { EventEmitter } from "node:events";

@Injectable()
export class ImportEventsService {
  private readonly emitter = new EventEmitter();

  emitFinished(payload: Record<string, unknown>) {
    this.emitter.emit("import.finished", payload);
  }

  onFinished(listener: (payload: Record<string, unknown>) => void) {
    this.emitter.on("import.finished", listener);
  }
}
