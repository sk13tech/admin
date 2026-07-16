import React from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

/* ─── iOS Navigation Bar ─── */
export const IOSNavBar: React.FC<{
  title: string;
  large?: boolean;
  leftAction?: { label: string; icon?: React.ReactNode; onClick: () => void };
  rightAction?: { label?: string; icon?: React.ReactNode; onClick: () => void };
}> = ({ title, large = false, leftAction, rightAction }) => (
  <div className="ios-blur flex-shrink-0 sticky top-0 z-40 border-b border-ios-separator/30 pt-[env(safe-area-inset-top)]">
    {/* Nav row with back/right actions — always for non-large, only when leftAction for large */}
    {(!large || !!leftAction) && (
      <div className="flex items-center justify-between px-4 h-[52px]">
        <div className="min-w-[70px] flex justify-start">
          {leftAction && (
            <button
              onClick={leftAction.onClick}
              className="flex items-center gap-0 text-ios-blue active:opacity-40 transition-opacity -ml-1.5 pr-2"
            >
              {leftAction.icon || <ChevronLeft size={28} strokeWidth={2.2} className="-mr-1" />}
              <span className="text-[17px]">{leftAction.label}</span>
            </button>
          )}
        </div>
        {!large && (
          <h1 className="text-[17px] font-[600] text-center flex-1 truncate px-2 text-ios-label">
            {title}
          </h1>
        )}
        <div className="min-w-[70px] flex justify-end">
          {!large && rightAction && (
            <button
              onClick={rightAction.onClick}
              className="flex items-center gap-1 text-ios-blue active:opacity-40 transition-opacity pl-2"
            >
              {rightAction.icon}
              {rightAction.label && <span className="text-[17px] font-[400]">{rightAction.label}</span>}
            </button>
          )}
        </div>
      </div>
    )}
    {large && (
      <div className="flex items-center justify-between px-5 py-[12px]">
        <h1 className="text-[34px] font-bold tracking-[0.01em] leading-[41px] text-ios-label">
          {title}
        </h1>
        {rightAction && (
          <button
            onClick={rightAction.onClick}
            className="flex items-center gap-1 text-ios-blue active:opacity-40 transition-opacity ml-3"
          >
            {rightAction.icon}
            {rightAction.label && <span className="text-[17px] font-[600]">{rightAction.label}</span>}
          </button>
        )}
      </div>
    )}
  </div>
);

/* ─── iOS Section Header ─── */
export const IOSSectionHeader: React.FC<{
  title: string;
  action?: { label: string; onClick: () => void };
}> = ({ title, action }) => (
  <div className="flex items-center justify-between px-5 pt-[26px] pb-[6px]">
    <span className="text-[13px] font-[400] text-ios-gray uppercase tracking-[0.02em]">
      {title}
    </span>
    {action && (
      <button onClick={action.onClick} className="text-[15px] text-ios-blue active:opacity-50 font-[400]">
        {action.label}
      </button>
    )}
  </div>
);

/* ─── iOS Card Group ─── */
export const IOSCardGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`mx-5 bg-white rounded-[12px] overflow-hidden shadow-[0_0_0_0.5px_rgba(0,0,0,0.04)] ${className}`}>
    {children}
  </div>
);

/* ─── iOS List Row ─── */
export const IOSListRow: React.FC<{
  label: string;
  value?: string | React.ReactNode;
  icon?: React.ReactNode;
  iconBg?: string;
  chevron?: boolean;
  onClick?: () => void;
  destructive?: boolean;
  toggle?: { checked: boolean; onChange: (v: boolean) => void };
  subtitle?: string;
  isLast?: boolean;
}> = ({ label, value, icon, iconBg, chevron, onClick, destructive, toggle, subtitle, isLast }) => (
  <div
    className={`flex items-center gap-3 px-4 min-h-[44px] py-[10px] ${
      onClick ? 'active:bg-black/[0.04] cursor-pointer' : ''
    }`}
    onClick={onClick}
  >
    {icon && (
      <div
        className={`w-[29px] h-[29px] rounded-[7px] flex items-center justify-center flex-shrink-0 ${
          iconBg || 'bg-ios-blue'
        }`}
      >
        {icon}
      </div>
    )}
    <div className={`flex-1 min-w-0 flex items-center gap-2 ${
      !isLast ? 'border-b border-ios-separator/25' : ''
    } py-[2px] min-h-[28px]`}>
      <div className="flex-1 min-w-0">
        <span className={`text-[17px] leading-[22px] ${destructive ? 'text-ios-red' : 'text-ios-label'}`}>
          {label}
        </span>
        {subtitle && (
          <p className="text-[13px] text-ios-gray leading-[18px] mt-[1px] line-clamp-2">{subtitle}</p>
        )}
      </div>
      {value && typeof value === 'string' ? (
        <span className="text-[17px] text-ios-gray flex-shrink-0 truncate max-w-[160px] leading-[22px]">
          {value}
        </span>
      ) : (
        value
      )}
      {toggle && (
        <input
          type="checkbox"
          className="ios-switch"
          checked={toggle.checked}
          onChange={(e) => { e.stopPropagation(); toggle.onChange(e.target.checked); }}
          onClick={(e) => e.stopPropagation()}
        />
      )}
      {chevron && <ChevronRight size={16} className="text-ios-gray3/80 flex-shrink-0 -mr-0.5" strokeWidth={2.5} />}
    </div>
  </div>
);

/* ─── iOS Input ─── */
export const IOSInput: React.FC<{
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  isLast?: boolean;
}> = ({ label, value, onChange, type = 'text', placeholder, isLast }) => (
  <div className={`flex items-center px-4 min-h-[44px] ${!isLast ? 'border-b border-ios-separator/25' : ''}`}>
    <label className="text-[17px] text-ios-label w-[100px] flex-shrink-0 leading-[22px]">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 text-[17px] text-right bg-transparent outline-none placeholder:text-ios-gray3 min-w-0 leading-[22px]"
    />
  </div>
);

/* ─── iOS TextArea ─── */
export const IOSTextArea: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  isLast?: boolean;
}> = ({ label, value, onChange, rows = 3, isLast }) => (
  <div className={`px-4 py-3 ${!isLast ? 'border-b border-ios-separator/25' : ''}`}>
    <label className="text-[13px] text-ios-gray uppercase tracking-[0.02em]">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full text-[17px] bg-transparent outline-none resize-none mt-1 leading-[22px]"
    />
  </div>
);

/* ─── iOS Button ─── */
export const IOSButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'destructive' | 'secondary';
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
}> = ({ children, onClick, variant = 'primary', className = '', fullWidth = true, disabled = false }) => {
  const variants = {
    primary: 'bg-ios-blue text-white active:bg-ios-blue/80',
    destructive: 'bg-ios-red/[0.12] text-ios-red active:bg-ios-red/20',
    secondary: 'bg-ios-gray5 text-ios-blue active:bg-ios-gray4',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-[50px] rounded-[12px] text-[17px] font-[600] transition-all disabled:opacity-40 ${variants[variant]} ${fullWidth ? 'w-full' : 'px-6'} ${className}`}
    >
      {children}
    </button>
  );
};

/* ─── iOS Sheet ─── */
export const IOSSheet: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-ios-bg rounded-t-[14px] max-h-[92vh] flex flex-col animate-ios-slide-up">
        <div className="flex justify-center pt-[6px] pb-0">
          <div className="w-[36px] h-[5px] rounded-full bg-ios-gray3/60" />
        </div>
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-ios-separator/20">
          <button onClick={onClose} className="text-ios-blue text-[17px] w-[70px] text-left active:opacity-50">
            Cancel
          </button>
          <h3 className="text-[17px] font-[600] flex-1 text-center truncate px-1">{title}</h3>
          <div className="w-[70px]" />
        </div>
        <div className="flex-1 overflow-y-auto ios-bounce pb-10">
          {children}
        </div>
      </div>
    </div>
  );
};

/* ─── iOS Alert Dialog ─── */
export const IOSAlert: React.FC<{
  open: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  destructive?: boolean;
}> = ({ open, title, message, onCancel, onConfirm, confirmLabel = 'Confirm', destructive = false }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative rounded-[14px] w-full max-w-[270px] animate-ios-fade-in shadow-2xl bg-white overflow-hidden">
        <div className="px-[16px] pt-[20px] pb-[16px] text-center">
          <h3 className="text-[17px] font-[600] text-ios-label mb-[3px]">{title}</h3>
          <p className="text-[13px] text-ios-label2 leading-[18px]">{message}</p>
        </div>
        <div className="border-t border-ios-separator/30 flex">
          <button onClick={onCancel} className="flex-1 py-[11px] text-[17px] text-ios-blue font-[400] border-r border-ios-separator/30 active:bg-black/[0.04]">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 py-[11px] text-[17px] font-[600] active:bg-black/[0.04] ${destructive ? 'text-ios-red' : 'text-ios-blue'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

/* ─── iOS Toast ─── */
export const IOSToast: React.FC<{ message: string }> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="fixed top-[calc(env(safe-area-inset-top)+8px)] left-1/2 -translate-x-1/2 z-[300] animate-ios-fade-in pointer-events-none">
      <div className="text-white px-5 py-[10px] rounded-[22px] text-[15px] font-[500] shadow-2xl whitespace-nowrap flex items-center gap-2 bg-[#1c1c1e]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
        {message}
      </div>
    </div>
  );
};

/* ─── iOS Search Bar ─── */
export const IOSSearchBar: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder = 'Search' }) => (
  <div className="px-5 py-[6px] flex-shrink-0">
    <div className="bg-ios-gray5/70 rounded-[10px] flex items-center px-[8px] h-[36px] gap-[6px]">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-[17px] placeholder:text-ios-gray leading-[22px]"
      />
      {value && (
        <button onClick={() => onChange('')} className="p-0.5">
          <div className="w-[18px] h-[18px] rounded-full bg-ios-gray3/80 flex items-center justify-center">
            <X size={11} className="text-white" strokeWidth={3} />
          </div>
        </button>
      )}
    </div>
  </div>
);

/* ─── iOS Badge ─── */
export const IOSBadge: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <span
    className="inline-flex items-center justify-center px-[8px] h-[20px] rounded-full text-[11px] font-[600] text-white capitalize leading-none whitespace-nowrap"
    style={{ backgroundColor: color }}
  >
    {label.replace(/_/g, ' ')}
  </span>
);

/* ─── iOS Segmented Control ─── */
export const IOSSegmentedControl: React.FC<{
  options: string[];
  selected: string;
  onChange: (v: string) => void;
}> = ({ options, selected, onChange }) => (
  <div className="mx-5 my-2 bg-ios-gray5/70 rounded-[9px] p-[2px] flex flex-shrink-0">
    {options.map((opt) => (
      <button
        key={opt}
        onClick={() => onChange(opt)}
        className={`flex-1 py-[5px] rounded-[7px] text-[13px] font-[500] transition-all capitalize ${
          selected === opt
            ? 'bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.04)] text-ios-label'
            : 'text-ios-gray'
        }`}
      >
        {opt.replace(/_/g, ' ')}
      </button>
    ))}
  </div>
);

/* ─── iOS Stat Card ─── */
export const IOSStatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-[14px] p-[14px] flex flex-col justify-between shadow-[0_0_0_0.5px_rgba(0,0,0,0.04)]" style={{ minHeight: 110 }}>
    <div className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center" style={{ backgroundColor: color + '16' }}>
      <div style={{ color }}>{icon}</div>
    </div>
    <div className="mt-auto pt-2">
      <p className="text-[24px] font-[700] tracking-[-0.01em] leading-[1] text-ios-label">{value}</p>
      <p className="text-[13px] text-ios-gray leading-[18px] mt-[3px] font-[400]">{label}</p>
    </div>
  </div>
);

/* ─── Avatar with safe fallback (no innerHTML) ─── */
const AvatarWithFallback: React.FC<{
  photoURL: string;
  name?: string;
  initials: string;
  size: number;
  fontSize: number;
  className: string;
}> = ({ photoURL, name, initials, size, fontSize, className }) => {
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return (
      <div className={`rounded-full bg-gradient-to-br from-ios-blue to-ios-purple flex items-center justify-center flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
        <span className="text-white font-[600]" style={{ fontSize }}>{initials}</span>
      </div>
    );
  }

  return (
    <div className={`rounded-full overflow-hidden bg-ios-gray5 flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <img
        src={photoURL}
        alt={name || 'User'}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    </div>
  );
};

/* ─── User Avatar ─── */
export const IOSUserAvatar: React.FC<{
  name?: string;
  photoURL?: string;
  size?: number;
  className?: string;
}> = ({ name, photoURL, size = 40, className = '' }) => {
  const initials = (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const fontSize = size <= 32 ? 12 : size <= 44 ? 15 : size <= 64 ? 22 : 28;

  if (photoURL) {
    return (
      <AvatarWithFallback photoURL={photoURL} name={name} initials={initials} size={size} fontSize={fontSize} className={className} />
    );
  }

  return (
    <div className={`rounded-full bg-gradient-to-br from-ios-blue to-ios-purple flex items-center justify-center flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <span className="text-white font-[600]" style={{ fontSize }}>{initials}</span>
    </div>
  );
};

/* ─── Empty State ─── */
export const IOSEmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}> = ({ icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
    <div className="text-ios-gray3 mb-4">{icon}</div>
    <h3 className="text-[20px] font-[600] text-ios-label mb-1">{title}</h3>
    {subtitle && <p className="text-[15px] text-ios-gray leading-[20px]">{subtitle}</p>}
  </div>
);
