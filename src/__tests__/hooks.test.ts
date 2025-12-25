import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('SDK Hooks', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('useStorage', () => {
    it('should store and retrieve values', async () => {
      const { useStorage } = await import('../hooks/useStorage');
      const { result } = renderHook(() => useStorage({ namespace: 'test-app' }));

      await act(async () => {
        result.current.set('key1', 'value1');
      });

      const value = result.current.get('key1');
      expect(value).toBe('value1');
    });

    it('should return null for non-existent keys', async () => {
      const { useStorage } = await import('../hooks/useStorage');
      const { result } = renderHook(() => useStorage({ namespace: 'test-app' }));

      const value = result.current.get('nonexistent');
      expect(value).toBeNull();
    });

    it('should remove values', async () => {
      const { useStorage } = await import('../hooks/useStorage');
      const { result } = renderHook(() => useStorage({ namespace: 'test-app' }));

      await act(async () => {
        result.current.set('key1', 'value1');
        result.current.remove('key1');
      });

      const value = result.current.get('key1');
      expect(value).toBeNull();
    });
  });

  describe('useClipboard', () => {
    it('should copy text to clipboard', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: { writeText: mockWriteText, readText: vi.fn() },
      });

      const { useClipboard } = await import('../hooks/useClipboard');
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.writeText('test text');
      });

      expect(mockWriteText).toHaveBeenCalledWith('test text');
    });
  });

  describe('useNative', () => {
    it('should detect browser environment', async () => {
      const { useNative } = await import('../hooks/useNative');
      const { result } = renderHook(() => useNative());

      expect(result.current.isNative).toBe(false);
      // In jsdom, Notification may not be available, but clipboard should be
      expect(result.current.hasClipboard).toBe(true);
    });

    it('should provide fallback for file operations', async () => {
      const { useNative } = await import('../hooks/useNative');
      const { result } = renderHook(() => useNative());

      await act(async () => {
        await result.current.writeFile('/test/file.txt', 'content');
      });

      const content = await result.current.readFile('/test/file.txt');
      expect(content).toBe('content');
    });
  });
});

describe('SDK Types', () => {
  it('should export all required types', async () => {
    const sdk = await import('../index');

    expect(sdk.createManifest).toBeDefined();
    expect(sdk.SDK_VERSION).toBeDefined();
  });

  it('should create valid manifest with defaults', async () => {
    const { createManifest } = await import('../index');

    const manifest = createManifest({
      identifier: 'ai.hanzo.test',
      name: 'Test App',
    });

    expect(manifest.identifier).toBe('ai.hanzo.test');
    expect(manifest.name).toBe('Test App');
    expect(manifest.version).toBe('1.0.0');
    expect(manifest.window).toBeDefined();
    expect(manifest.window?.resizable).toBe(true);
  });
});
