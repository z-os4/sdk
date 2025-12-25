/**
 * Mock Tauri plugins for testing
 *
 * These mocks are used during testing when Tauri plugins are not available.
 * In the actual app, the browser fallback paths are used when not in Tauri.
 */

// fs plugin
export const readTextFile = async () => '';
export const writeTextFile = async () => {};

// notification plugin
export const sendNotification = async () => {};

// clipboard-manager plugin
export const writeText = async () => {};
export const readText = async () => '';

// dialog plugin
export const open = async () => null;
export const save = async () => null;

// shell plugin
export { open as shellOpen };
