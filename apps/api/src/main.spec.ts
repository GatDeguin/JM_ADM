import { describe, expect, it, vi } from "vitest";
import { apiPathMappingMiddleware } from "./middleware/api-path-mapping.middleware";

describe("api path mapping middleware integration", () => {
  it("redirige rutas sin prefijo y conserva query params", () => {
    const req = {
      path: "/users",
      originalUrl: "/users?page=2",
      url: "/users?page=2",
    };
    const res = {
      redirect: vi.fn(),
      setHeader: vi.fn(),
    };
    const next = vi.fn();

    apiPathMappingMiddleware(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith(308, "/api/v1/system/users?page=2");
    expect(next).not.toHaveBeenCalled();
  });

  it("redirige rutas legadas con prefijo y conserva query params", () => {
    const req = {
      path: "/api/v1/users",
      originalUrl: "/api/v1/users?page=2",
      url: "/api/v1/users?page=2",
    };
    const res = {
      redirect: vi.fn(),
      setHeader: vi.fn(),
    };
    const next = vi.fn();

    apiPathMappingMiddleware(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith(308, "/api/v1/system/users?page=2");
    expect(next).not.toHaveBeenCalled();
  });

  it("remapea /api/v1/system/users?page=2 y preserva query para controlador", () => {
    const req = {
      path: "/api/v1/system/users",
      originalUrl: "/api/v1/system/users?page=2",
      url: "/api/v1/system/users?page=2",
    };
    const res = {
      redirect: vi.fn(),
      setHeader: vi.fn(),
    };
    const next = vi.fn(() => {
      const mapped = new URL(req.url, "http://localhost");
      expect(mapped.pathname).toBe("/api/v1/users");
      expect(mapped.searchParams.get("page")).toBe("2");
      expect(mapped.search).toBe("?page=2");
    });

    apiPathMappingMiddleware(req, res, next);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("remapea /api/v1/stock/balances?q=cherry&limit=20 y preserva query para controlador", () => {
    const req = {
      path: "/api/v1/stock/balances",
      originalUrl: "/api/v1/stock/balances?q=cherry&limit=20",
      url: "/api/v1/stock/balances?q=cherry&limit=20",
    };
    const res = {
      redirect: vi.fn(),
      setHeader: vi.fn(),
    };
    const next = vi.fn(() => {
      const mapped = new URL(req.url, "http://localhost");
      expect(mapped.pathname).toBe("/api/v1/inventory/balances");
      expect(mapped.searchParams.get("q")).toBe("cherry");
      expect(mapped.searchParams.get("limit")).toBe("20");
      expect(mapped.search).toBe("?q=cherry&limit=20");
    });

    apiPathMappingMiddleware(req, res, next);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
