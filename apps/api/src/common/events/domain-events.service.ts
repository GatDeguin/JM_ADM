import { Injectable } from "@nestjs/common";
import { EventEmitter } from "node:events";

type DomainEventPayload = {
  name: string;
  entity: string;
  entityId: string;
  occurredAt: string;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class DomainEventsService {
  private readonly emitter = new EventEmitter();

  emit(payload: DomainEventPayload) {
    this.emitter.emit(payload.name, payload);
  }

  on(name: string, listener: (payload: DomainEventPayload) => void) {
    this.emitter.on(name, listener);
  }
}
