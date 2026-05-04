function IconBase({ children, size = 22, className = "", title = "icon" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label={title}
    >
      {children}
    </svg>
  );
}

export function BotIcon(props) {
  return (
    <IconBase {...props} title="bot">
      <rect x="5" y="8" width="14" height="11" rx="3" />
      <path d="M12 8V4" />
      <circle cx="12" cy="3" r="1" />
      <path d="M9 13h.01" />
      <path d="M15 13h.01" />
      <path d="M9.5 17h5" />
    </IconBase>
  );
}

export function CheckIcon(props) {
  return (
    <IconBase {...props} title="check">
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </IconBase>
  );
}

export function ClockIcon(props) {
  return (
    <IconBase {...props} title="clock">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </IconBase>
  );
}

export function ShieldIcon(props) {
  return (
    <IconBase {...props} title="shield">
      <path d="M12 3 5 6v5c0 5 3.5 8.5 7 10 3.5-1.5 7-5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-5" />
    </IconBase>
  );
}

export function PlayIcon(props) {
  return (
    <IconBase {...props} title="play">
      <path d="M8 5v14l11-7L8 5Z" />
    </IconBase>
  );
}

export function PauseIcon(props) {
  return (
    <IconBase {...props} title="pause">
      <path d="M9 5v14" />
      <path d="M15 5v14" />
    </IconBase>
  );
}

export function SendIcon(props) {
  return (
    <IconBase {...props} title="send">
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
      <path d="M22 2 11 13" />
    </IconBase>
  );
}

export function AlertIcon(props) {
  return (
    <IconBase {...props} title="alert">
      <path d="M12 3 2 21h20L12 3Z" />
      <path d="M12 9v5" />
      <path d="M12 18h.01" />
    </IconBase>
  );
}

export function DollarIcon(props) {
  return (
    <IconBase {...props} title="dollar">
      <path d="M12 2v20" />
      <path d="M17 6H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
    </IconBase>
  );
}

export function MessageIcon(props) {
  return (
    <IconBase {...props} title="message">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </IconBase>
  );
}

export function CalendarIcon(props) {
  return (
    <IconBase {...props} title="calendar">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 11h18" />
    </IconBase>
  );
}

export function SearchIcon(props) {
  return (
    <IconBase {...props} title="search">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </IconBase>
  );
}

export function GlobeIcon(props) {
  return (
    <IconBase {...props} title="globe">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </IconBase>
  );
}

export function ClipboardIcon(props) {
  return (
    <IconBase {...props} title="clipboard">
      <path d="M9 4h6l1 2h2a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2l1-2Z" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </IconBase>
  );
}

export function SheetIcon(props) {
  return (
    <IconBase {...props} title="sheet">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </IconBase>
  );
}

export function TrashIcon(props) {
  return (
    <IconBase {...props} title="trash">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </IconBase>
  );
}

export function StopIcon(props) {
  return (
    <IconBase {...props} title="stop">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </IconBase>
  );
}

export function DownloadIcon(props) {
  return (
    <IconBase {...props} title="download">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </IconBase>
  );
}

export function CopyIcon(props) {
  return (
    <IconBase {...props} title="copy">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </IconBase>
  );
}
