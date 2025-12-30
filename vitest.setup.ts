import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { server } from "@/mocks/server";

export let mockWebSocket: any;

beforeAll(() => {
  // Mock WebSocket
  mockWebSocket = {
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null,
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    readyState: 1, // OPEN
  };
  vi.stubGlobal('WebSocket', vi.fn(() => mockWebSocket));

  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(() => 'mock-jwt-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    },
    writable: true,
  });

  // Start MSW server with proper error handling
  try {
    server.listen({ onUnhandledRequest: "warn" });
  } catch (error) {
    console.warn('MSW server already initialized', error);
  }
});

beforeEach(() => {
  // Reset MSW handlers before each test
  server.resetHandlers();
});

afterEach(() => {
  // Additional cleanup after each test
  vi.clearAllMocks();
});

afterAll(async () => {
  // Properly close MSW server
  try {
    server.close();
  } catch (error) {
    console.warn('Error closing MSW server', error);
  }
  // Cleanup all globals
  vi.unstubAllGlobals();
});
