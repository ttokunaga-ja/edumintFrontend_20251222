import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "@/mocks/server";

export let mockWebSocket: any;

beforeAll(() => {
  mockWebSocket = {
    onopen: null,
    onmessage: null,
    onerror: null,
    close: vi.fn(),
    readyState: 1, // OPEN
  };
  vi.stubGlobal('WebSocket', vi.fn(() => mockWebSocket));

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(() => 'mock-jwt-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true,
  });

  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());
