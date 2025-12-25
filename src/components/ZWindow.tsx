/**
 * ZWindow Component Stub
 *
 * The actual window implementation lives in @z-os/ui. This stub provides
 * type compatibility for apps that use ZOSApp wrapper from the SDK.
 *
 * For full window functionality, import ZWindow directly from @z-os/ui.
 */

import React, { ReactNode } from 'react';

interface ZWindowProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onFocus?: () => void;
  initialSize?: { width: number; height: number };
  initialPosition?: { x: number; y: number };
  windowType?: string;
  resizable?: boolean;
  customControls?: ReactNode;
  className?: string;
}

/**
 * ZWindow - Window wrapper component
 *
 * Note: This is a basic implementation. For full macOS-style window chrome,
 * use ZWindow from @z-os/ui package which includes:
 * - Title bar with traffic lights
 * - Drag-to-move
 * - Resize handles
 * - Window state management
 */
export function ZWindow({
  title,
  children,
  onClose,
  onFocus,
  initialSize,
  resizable,
  customControls,
  className,
}: ZWindowProps): JSX.Element {
  const style: React.CSSProperties = {
    width: initialSize?.width || 700,
    height: initialSize?.height || 500,
    backgroundColor: 'var(--zos-window-bg, #1e1e1e)',
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div
      className={`zos-window ${className || ''}`}
      style={style}
      onClick={onFocus}
    >
      {/* Title Bar */}
      <div
        style={{
          height: 38,
          backgroundColor: 'var(--zos-titlebar-bg, #2d2d2d)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          userSelect: 'none',
        }}
      >
        {/* Traffic Lights */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#ff5f57',
              border: 'none',
              cursor: 'pointer',
            }}
            aria-label="Close"
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#febc2e',
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#28c840',
            }}
          />
        </div>
        {/* Title */}
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            color: 'var(--zos-titlebar-text, #fff)',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {title}
        </div>
        {/* Custom Controls */}
        {customControls && <div>{customControls}</div>}
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
    </div>
  );
}

export default ZWindow;
