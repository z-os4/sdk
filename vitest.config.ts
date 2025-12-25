import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// Mock Tauri plugins for testing - these are only available at runtime in Tauri
const tauriPluginMock = path.resolve(__dirname, 'src/__tests__/__mocks__/tauri-plugin.ts');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@tauri-apps/plugin-fs': tauriPluginMock,
      '@tauri-apps/plugin-notification': tauriPluginMock,
      '@tauri-apps/plugin-clipboard-manager': tauriPluginMock,
      '@tauri-apps/plugin-dialog': tauriPluginMock,
      '@tauri-apps/plugin-shell': tauriPluginMock,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
