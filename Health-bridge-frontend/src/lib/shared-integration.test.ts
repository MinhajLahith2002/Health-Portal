import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const requestUse = vi.fn();
  const responseUse = vi.fn();
  const client = {
    interceptors: {
      request: { use: requestUse },
      response: { use: responseUse },
    },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };

  return { client, requestUse, responseUse };
});

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => mocks.client),
    isAxiosError: vi.fn(() => true),
  },
}));

import api, { getApiErrorMessage } from "@/lib/axios";
import { ROLE_ROUTE_MAP } from "@/constants/routes";
import { useDoctors } from "@/hooks/useDoctors";
import { usePatients } from "@/hooks/usePatients";
import { useNotifications } from "@/hooks/useNotifications";

beforeEach(() => {
  mocks.client.get.mockClear();
  mocks.client.post.mockClear();
  mocks.client.put.mockClear();
  mocks.client.patch.mockClear();
  mocks.client.delete.mockClear();
});

describe("shared API integration contracts", () => {
  it("configures request and response interceptors", () => {
    expect(mocks.requestUse).toHaveBeenCalledOnce();
    expect(mocks.responseUse).toHaveBeenCalledOnce();
  });

  it("unwraps standardized successful API responses", async () => {
    mocks.client.post.mockResolvedValue({
      data: {
        success: true,
        data: { id: "user-1" },
        message: "Loaded",
      },
    });

    const responseInterceptor = mocks.responseUse.mock.calls[0][0];
    const response = {
      data: {
        success: true,
        data: { id: "user-1" },
        message: "Loaded",
      },
      status: 200,
      config: { url: "/auth/login" },
    };

    const normalizedResponse = responseInterceptor(response);
    mocks.client.post.mockResolvedValue(normalizedResponse);

    await expect(api.post("/auth/login", { email: "user@example.com" })).resolves.toEqual({
      id: "user-1",
    });
  });

  it("extracts useful messages from standardized API errors", () => {
    expect(
      getApiErrorMessage({
        response: { data: { errors: { email: "Email is invalid" } } },
      }),
    ).toBe("Email is invalid");
  });
});

describe("protected route contracts", () => {
  it("defines a dashboard route for every supported role", () => {
    expect(Object.keys(ROLE_ROUTE_MAP)).toEqual([
      "PATIENT",
      "ADMIN",
      "SUPER_ADMIN",
      "DOCTOR",
      "PHARMACIST",
      "INSURANCE_OFFICER",
      "LAB_OFFICER",
    ]);

    for (const route of Object.values(ROLE_ROUTE_MAP)) {
      expect(route).toMatch(/^\/[^/]+\/dashboard$/);
    }
  });
});

describe("shared hook layer", () => {
  it("exposes the shared doctor, patient, and notification hooks", () => {
    expect(typeof useDoctors).toBe("function");
    expect(typeof usePatients).toBe("function");
    expect(typeof useNotifications).toBe("function");
  });
});
