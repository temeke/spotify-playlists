import '@testing-library/jest-dom'
import '../index.css'

// Mock localStorage for tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock crypto for PKCE tests
Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues: vi.fn().mockImplementation((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    subtle: {
      digest: vi.fn().mockImplementation(() => 
        Promise.resolve(new ArrayBuffer(32))
      ),
    },
  },
});

// Mock window.location for tests
delete (window as any).location;
window.location = {
  ...window.location,
  href: 'http://localhost:5173',
  origin: 'http://localhost:5173',
  pathname: '/',
  search: '',
  hash: '',
  assign: vi.fn(),
  reload: vi.fn(),
  replace: vi.fn(),
};

// Mock window.history for tests
Object.defineProperty(window, 'history', {
  value: {
    pushState: vi.fn(),
    replaceState: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn(),
    length: 1,
    state: null,
  },
  writable: true,
});

// Set test environment
process.env.NODE_ENV = 'test';
