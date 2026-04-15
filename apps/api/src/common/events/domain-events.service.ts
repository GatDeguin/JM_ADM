import { Injectable } from "@nestjs/common";
import { EventEmitter } from "node:events";
import { DomainEventEnvelope } from "./domain-event-contract";

@Injectable()
export class DomainEventsService {
  private readonly emitter = new EventEmitter();

  emit(payload: DomainEventEnvelope | ({ name: string } & Record<string, unknown>)) {
    this.emitter.emit(payload.name, payload);
  }

  on(name: string, listener: (payload: DomainEventEnvelope | ({ name: string } & Record<string, unknown>)) => void) {
    this.emitter.on(name, listener);
  }
}
