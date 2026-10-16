import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

/* Small form + layout kit for the app, built on the site's design tokens. */

export const inputClass =
  "w-full rounded-btn border border-outline bg-surface px-3.5 py-3 text-[16px] text-ink placeholder:text-secondary transition-colors focus:border-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[14px] font-semibold text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[13px] text-red">{error}</p>
      ) : hint ? (
        <p className="text-[13px] text-secondary">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return <input ref={ref} className={`${inputClass} ${className}`} {...props} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = "", ...props }, ref) {
  return <textarea ref={ref} className={`${inputClass} leading-[1.55] ${className}`} {...props} />;
});

export function Select({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${inputClass} appearance-auto ${className}`} {...props}>
      {children}
    </select>
  );
}

type Variant = "ink" | "outline" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  ink: "bg-ink text-on-dark hover:bg-red hover:text-white",
  outline: "border border-outline text-ink hover:border-ink",
  ghost: "text-ink hover:text-red",
  danger: "border border-outline text-red hover:border-red",
};

export const buttonClass = (variant: Variant = "ink", extra = "") =>
  `inline-flex min-h-11 items-center justify-center gap-2 rounded-btn px-5 text-[15px] font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${extra}`;

export function Button({
  variant = "ink",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}

export function Alert({
  tone = "error",
  children,
}: {
  tone?: "error" | "info" | "success";
  children: ReactNode;
}) {
  const tones = {
    error: "border-red/40 bg-red/5 text-ink",
    info: "border-rule bg-panel text-ink",
    success: "border-green/40 bg-green/5 text-ink",
  };
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-panel border px-4 py-3 text-[15px] leading-[1.5] ${tones[tone]}`}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-8">
      <div className="flex flex-col gap-3">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="font-serif text-[clamp(30px,3.4vw,40px)] leading-[1.08] font-normal tracking-[-0.02em]">
          {title}
        </h1>
      </div>
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-card border border-[var(--rule-card)] bg-surface ${className}`}>
      {children}
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-[15px] text-secondary">
      <span
        aria-hidden
        className="size-4 animate-spin rounded-full border-2 border-rule border-t-ink"
      />
      {label}
    </span>
  );
}

/** Score chip: red under the house standard, green at or above it. */
export function ScoreBadge({ score, standard = 90 }: { score: number; standard?: number }) {
  const pass = score >= standard;
  return (
    <span
      className={`inline-flex min-w-12 items-baseline justify-center rounded-tag px-2 py-0.5 font-serif text-[18px] font-medium ${
        pass ? "bg-green/12 text-green-text" : "bg-red/10 text-red"
      }`}
      aria-label={`Score ${score} of 100`}
    >
      {score}
    </span>
  );
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
