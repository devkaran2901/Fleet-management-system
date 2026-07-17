import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, Loader2, X, XCircle } from 'lucide-react';

// --- Panel ------------------------------------------------------------------

export const Panel: React.FC<{
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  padded?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ title, subtitle, actions, padded = true, className = '', style, children }) => (
  <section className={`adm-panel ${className}`} style={style}>
    {(title || actions) && (
      <header className="adm-panel-head">
        <div>
          {title && <h3 className="adm-panel-title">{title}</h3>}
          {subtitle && <p className="adm-panel-sub">{subtitle}</p>}
        </div>
        {actions && <div className="adm-panel-actions">{actions}</div>}
      </header>
    )}
    <div className={padded ? 'adm-panel-body' : ''}>{children}</div>
  </section>
);

// --- Button -----------------------------------------------------------------

type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'subtle';

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    loading?: boolean;
    icon?: React.ReactNode;
    size?: 'sm' | 'md';
  }
> = ({ variant = 'subtle', loading, icon, size = 'md', children, disabled, className = '', ...rest }) => (
  <button
    {...rest}
    disabled={disabled || loading}
    className={`adm-btn adm-btn-${variant} adm-btn-${size} ${className}`}
  >
    {loading ? <Loader2 size={14} className="adm-spin" /> : icon}
    {children}
  </button>
);

// --- Badge ------------------------------------------------------------------

export type BadgeTone = 'green' | 'amber' | 'red' | 'grey' | 'blue';

export const Badge: React.FC<{ tone?: BadgeTone; children: React.ReactNode }> = ({
  tone = 'grey',
  children,
}) => <span className={`adm-badge adm-badge-${tone}`}>{children}</span>;

// --- Field ------------------------------------------------------------------

export const Field: React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, hint, children }) => (
  <label className="adm-field">
    <span className="adm-field-label mono-label">{label}</span>
    {children}
    {hint && <span className="adm-field-hint">{hint}</span>}
  </label>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className = '',
  ...rest
}) => <input {...rest} className={`adm-input ${className}`} />;

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <select {...rest} className={`adm-input adm-select ${className}`}>
    {children}
  </select>
);

// --- Modal ------------------------------------------------------------------

export const Modal: React.FC<{
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  footer?: React.ReactNode;
  wide?: boolean;
  children: React.ReactNode;
}> = ({ open, title, subtitle, onClose, footer, wide, children }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="adm-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className={`adm-modal ${wide ? 'adm-modal-wide' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="adm-modal-head">
          <div>
            <h3 className="adm-panel-title">{title}</h3>
            {subtitle && <p className="adm-panel-sub">{subtitle}</p>}
          </div>
          <button className="adm-icon-btn" onClick={onClose} aria-label="Close dialog">
            <X size={16} />
          </button>
        </header>
        <div className="adm-modal-body">{children}</div>
        {footer && <footer className="adm-modal-foot">{footer}</footer>}
      </div>
    </div>
  );
};

// --- Toast ------------------------------------------------------------------

type ToastTone = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

const ToastContext = createContext<{
  notify: (tone: ToastTone, message: string) => void;
}>({ notify: () => {} });

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((tone: ToastTone, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, tone, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="adm-toast-stack" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`adm-toast adm-toast-${toast.tone}`}>
            {toast.tone === 'success' && <CheckCircle2 size={16} />}
            {toast.tone === 'error' && <XCircle size={16} />}
            {toast.tone === 'info' && <Info size={16} />}
            <span>{toast.message}</span>
            <button className="adm-icon-btn" onClick={() => dismiss(toast.id)} aria-label="Dismiss">
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// --- States -----------------------------------------------------------------

export const LoadingState: React.FC<{ label?: string }> = ({ label = 'Loading' }) => (
  <div className="adm-state">
    <Loader2 size={20} className="adm-spin" />
    <span className="mono-label">{label}…</span>
  </div>
);

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className="adm-state adm-state-error">
    <AlertTriangle size={20} />
    <span>{message}</span>
    {onRetry && (
      <Button variant="subtle" size="sm" onClick={onRetry}>
        Retry
      </Button>
    )}
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  hint?: string;
  action?: React.ReactNode;
}> = ({ title, hint, action }) => (
  <div className="adm-state">
    <span className="adm-empty-title">{title}</span>
    {hint && <span className="adm-empty-hint">{hint}</span>}
    {action}
  </div>
);

// --- Toggle -----------------------------------------------------------------

export const Toggle: React.FC<{
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}> = ({ checked, onChange, label, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`adm-toggle ${checked ? 'is-on' : ''}`}
  >
    <span className="adm-toggle-knob" />
  </button>
);
