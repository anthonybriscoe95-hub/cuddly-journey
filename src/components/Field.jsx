import { cls } from "../lib/utils.js";

export default function Field({
  label,
  hint,
  required,
  className,
  children,
}) {
  return (
    <div className={cls("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-flame-400">*</span>}
        </label>
      )}
      {children}
      {hint && <span className="text-[11px] text-zinc-500">{hint}</span>}
    </div>
  );
}

export function Textarea({ rows = 4, ...props }) {
  return <textarea rows={rows} {...props} />;
}

export function Select({ children, ...props }) {
  return <select {...props}>{children}</select>;
}
