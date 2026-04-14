import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";

type PrismaTxLike = Pick<PrismaService, "auditLog">;

type BaseAuditPayload = {
  userId?: string | null;
  entity: string;
  entityId: string;
  action: string;
  origin: string;
  before?: unknown;
  after?: unknown;
};

@Injectable()
export class AuditTrailService {
  constructor(private readonly prisma: PrismaService) {}

  async log(payload: BaseAuditPayload, tx?: PrismaTxLike) {
    const client = tx ?? this.prisma;
    await client.auditLog.create({
      data: {
        userId: payload.userId ?? null,
        entity: payload.entity,
        entityId: payload.entityId,
        action: payload.action,
        origin: payload.origin,
        before: payload.before as never,
        after: payload.after as never,
      },
    });
  }

  logCreate(payload: Omit<BaseAuditPayload, "action">, tx?: PrismaTxLike) {
    return this.log({ ...payload, action: "create" }, tx);
  }

  logUpdate(payload: Omit<BaseAuditPayload, "action">, tx?: PrismaTxLike) {
    return this.log({ ...payload, action: "update" }, tx);
  }

  logMerge(payload: Omit<BaseAuditPayload, "action">, tx?: PrismaTxLike) {
    return this.log({ ...payload, action: "merge" }, tx);
  }

  logHomologation(payload: Omit<BaseAuditPayload, "action">, tx?: PrismaTxLike) {
    return this.log({ ...payload, action: "homologation" }, tx);
  }

  logImport(payload: Omit<BaseAuditPayload, "action">, tx?: PrismaTxLike) {
    return this.log({ ...payload, action: "import" }, tx);
  }

  logTransactionalAction(payload: Omit<BaseAuditPayload, "action">, tx?: PrismaTxLike) {
    return this.log({ ...payload, action: "transactional_action" }, tx);
  }
}
