import React from 'react';

interface VelocityLogoProps {
  /** Height of the icon mark in pixels. Default 36px */
  height?: number;
  /** Whether to show text alongside or below the icon mark. Default true */
  showText?: boolean;
  /** Layout orientation: 'horizontal' (sidebar) or 'stacked' (login/splash). Default 'horizontal' */
  layout?: 'horizontal' | 'stacked';
  /** Explicit text color for TRAV wordmark if needed. Defaults to var(--text-1) */
  textColor?: string;
  /** Custom class name */
  className?: string;
}

export const VelocityLogo: React.FC<VelocityLogoProps> = ({
  height = 36,
  showText = true,
  layout = 'horizontal',
  textColor,
  className = '',
}) => {
  const iconWidth = height * 1.35;

  return (
    <div
      className={`velocity-logo-wrap ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: layout === 'stacked' ? 'column' : 'row',
        alignItems: 'center',
        gap: layout === 'stacked' ? 10 : Math.max(10, height * 0.28),
        userSelect: 'none',
        maxWidth: '100%',
      }}
    >
      {/* Velocity Arrow Icon Mark with True Vector Mask Lightning Cutout */}
      <svg
        width={iconWidth}
        height={height}
        viewBox="10 8 144 84"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, display: 'block' }}
      >
        <defs>
          <mask id="travLightningCutout">
            {/* White retains graphic */}
            <rect x="0" y="0" width="160" height="100" fill="#FFFFFF" />
            {/* Black cuts through as true transparent negative space */}
            <path
              d="M 92 18 L 140 48 L 96 48 L 108 34 L 88 34 Z"
              fill="#000000"
            />
          </mask>
        </defs>

        <g fill="#10B981" mask="url(#travLightningCutout)">
          {/* Row 1: Top speed lines */}
          <rect x="36" y="16" width="16" height="7" rx="3.5" />
          <rect x="58" y="16" width="34" height="7" rx="3.5" />

          {/* Row 2: Mid-upper speed line */}
          <rect x="24" y="32" width="30" height="7" rx="3.5" />

          {/* Main Solid Arrowhead (Right Pointing) */}
          <path d="M 96 10 L 152 50 L 96 90 L 96 64 L 64 64 L 64 36 L 96 36 Z" />

          {/* Row 3: Lower-mid speed lines */}
          <rect x="14" y="48" width="40" height="7" rx="3.5" />

          {/* Row 4: Bottom speed lines */}
          <rect x="24" y="64" width="22" height="7" rx="3.5" />
          <rect x="52" y="64" width="30" height="7" rx="3.5" />

          {/* Row 5: Lowermost speed line */}
          <rect x="36" y="80" width="36" height="7" rx="3.5" />
        </g>
      </svg>

      {/* Brand Text */}
      {showText && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: layout === 'stacked' ? 'center' : 'left',
            lineHeight: 1,
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {/* Main Brand Name */}
          <div
            style={{
              fontSize: layout === 'stacked' ? height * 0.58 : height * 0.5,
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: textColor || 'var(--text-1, #F2F3F4)',
              textTransform: 'uppercase',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: 1.05,
              whiteSpace: 'nowrap',
            }}
          >
            TRAV<span style={{ color: 'var(--green, #10B981)' }}>ERSE</span>
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: Math.max(7, height * 0.18),
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: 'var(--text-3, #757B82)',
              textTransform: 'uppercase',
              marginTop: Math.max(3, height * 0.08),
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            FLEET & LOGISTICS MANAGEMENT
          </div>
        </div>
      )}
    </div>
  );
};
