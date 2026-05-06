import { cls } from "../lib/utils.js";

const variants = {
  primary: "btn-primary",
  ghost: "btn-ghost",
  outline: "btn-outline",
  subtle:
    "btn bg-flame-500/10 text-flame-400 hover:bg-flame-500/15 border border-flame-500/30",
  danger:
    "btn bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30",
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}) {
  return (
    <button
      className={cls(
        variants[variant] || variants.primary,
        size === "sm" && "px-2.5 py-1.5 text-xs",
        size === "lg" && "px-4 py-2.5 text-sm",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({ className, children, ...props }) {
  return (
    <button
      className={cls(
        "grid h-8 w-8 place-items-center rounded-lg border border-ink-700 bg-ink-850 text-zinc-400 transition-colors hover:border-flame-500/40 hover:text-flame-400",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
