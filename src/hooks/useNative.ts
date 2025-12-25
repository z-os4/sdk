/**
 * useNative - Detect and use native APIs when running in Tauri shell
 *
 * zOS runs 100% in browser. When running in Tauri, native features are available.
 * This hook provides graceful fallbacks for browser-only mode.
 */

import { useState, useEffect, useCallback } from 'react';

declare global {
  interface Window {
    __TAURI__?: {
      invoke: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
    };
    __TAURI_NATIVE__?: boolean;
  }
}

interface NativeCapabilities {
  isNative: boolean;
  hasFileSystem: boolean;
  hasNotifications: boolean;
  hasClipboard: boolean;
  hasDialog: boolean;
  hasShell: boolean;
}

interface UseNativeReturn extends NativeCapabilities {
  // File system (native or browser fallback)
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;

  // Notifications (native or browser Notification API)
  notify: (title: string, body?: string) => Promise<void>;

  // Clipboard (native or browser clipboard API)
  copyToClipboard: (text: string) => Promise<void>;
  readFromClipboard: () => Promise<string>;

  // Dialog (native or browser prompt/confirm)
  showOpenDialog: (options?: { multiple?: boolean; directory?: boolean }) => Promise<string[]>;
  showSaveDialog: (options?: { defaultPath?: string }) => Promise<string | null>;

  // Shell (native only)
  openExternal: (url: string) => Promise<void>;
}

export function useNative(): UseNativeReturn {
  const [capabilities, setCapabilities] = useState<NativeCapabilities>({
    isNative: false,
    hasFileSystem: false,
    hasNotifications: false,
    hasClipboard: false,
    hasDialog: false,
    hasShell: false,
  });

  useEffect(() => {
    const checkCapabilities = async () => {
      const isNative = !!window.__TAURI_NATIVE__ || !!window.__TAURI__;

      setCapabilities({
        isNative,
        hasFileSystem: isNative,
        hasNotifications: isNative || 'Notification' in window,
        hasClipboard: isNative || 'clipboard' in navigator,
        hasDialog: isNative,
        hasShell: isNative,
      });
    };

    checkCapabilities();
  }, []);

  // File System
  const readFile = useCallback(async (path: string): Promise<string> => {
    if (window.__TAURI__) {
      // Dynamic import - only available at runtime in Tauri
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod = await import('@tauri-apps/plugin-fs' as any);
      return mod.readTextFile(path);
    }
    // Browser fallback: use localStorage or IndexedDB
    return localStorage.getItem(`zos:file:${path}`) || '';
  }, []);

  const writeFile = useCallback(async (path: string, content: string): Promise<void> => {
    if (window.__TAURI__) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod = await import('@tauri-apps/plugin-fs' as any);
      await mod.writeTextFile(path, content);
      return;
    }
    // Browser fallback
    localStorage.setItem(`zos:file:${path}`, content);
  }, []);

  // Notifications
  const notify = useCallback(async (title: string, body?: string): Promise<void> => {
    if (window.__TAURI__) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod = await import('@tauri-apps/plugin-notification' as any);
      await mod.sendNotification({ title, body });
      return;
    }
    // Browser fallback
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    }
  }, []);

  // Clipboard
  const copyToClipboard = useCallback(async (text: string): Promise<void> => {
    if (window.__TAURI__) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod = await import('@tauri-apps/plugin-clipboard-manager' as any);
      await mod.writeText(text);
      return;
    }
    await navigator.clipboard.writeText(text);
  }, []);

  const readFromClipboard = useCallback(async (): Promise<string> => {
    if (window.__TAURI__) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod = await import('@tauri-apps/plugin-clipboard-manager' as any);
      return await mod.readText() || '';
    }
    return navigator.clipboard.readText();
  }, []);

  // Dialogs
  const showOpenDialog = useCallback(async (options?: { multiple?: boolean; directory?: boolean }): Promise<string[]> => {
    if (window.__TAURI__) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod = await import('@tauri-apps/plugin-dialog' as any);
      const result = await mod.open({
        multiple: options?.multiple,
        directory: options?.directory,
      });
      if (!result) return [];
      return Array.isArray(result) ? result : [result];
    }
    // Browser fallback: use file input
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = options?.multiple || false;
      input.onchange = () => {
        const files = Array.from(input.files || []).map(f => f.name);
        resolve(files);
      };
      input.click();
    });
  }, []);

  const showSaveDialog = useCallback(async (options?: { defaultPath?: string }): Promise<string | null> => {
    if (window.__TAURI__) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod = await import('@tauri-apps/plugin-dialog' as any);
      return mod.save({ defaultPath: options?.defaultPath });
    }
    // Browser fallback: prompt for filename
    return prompt('Save as:', options?.defaultPath || 'untitled.txt');
  }, []);

  // Shell
  const openExternal = useCallback(async (url: string): Promise<void> => {
    if (window.__TAURI__) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod = await import('@tauri-apps/plugin-shell' as any);
      await mod.open(url);
      return;
    }
    window.open(url, '_blank');
  }, []);

  return {
    ...capabilities,
    readFile,
    writeFile,
    notify,
    copyToClipboard,
    readFromClipboard,
    showOpenDialog,
    showSaveDialog,
    openExternal,
  };
}

export default useNative;
