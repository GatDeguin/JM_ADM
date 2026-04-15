import { afterEach, describe, expect, it, vi } from "vitest";
import { logOriginAudit } from "../components/workflows/api";
import { API_BASE_URL } from "../lib/env";

describe("logOriginAudit", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("envía el registro al endpoint de auditoría normalizado", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "audit-1" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await logOriginAudit({
      entity: "sales-order",
      entityId: "so-1",
      action: "create",
      origin: "comercial/pedidos",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, requestInit] = fetchMock.mock.calls[0];

    expect(url).toBe(`${API_BASE_URL}/audit/audit-logs`);
    expect(requestInit).toMatchObject({ method: "POST" });
    expect(JSON.parse(String(requestInit?.body))).toMatchObject({
      entity: "sales-order",
      entityId: "so-1",
      action: "create",
      origin: "comercial/pedidos",
    });
  });
});
