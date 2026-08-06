import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import { X } from "lucide-react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }): ReactElement {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`premium-card ${className}`}
    >
      {children}
    </motion.section>
  );
}

export function Button({ variant = "secondary", loading = false, children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; loading?: boolean }): ReactElement {
  return (
    <button className={`btn btn-${variant} ${className}`} disabled={props.disabled || loading} {...props}>
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      {children}
    </button>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }): ReactElement {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent)]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function MetricCard({ label, value, detail, icon }: { label: string; value: string | number; detail?: string; icon?: ReactNode }): ReactElement {
  return (
    <Card className="group overflow-hidden p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-2 text-[var(--accent)] transition group-hover:scale-105">{icon}</div>
      </div>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
      {detail ? <p className="mt-2 text-xs text-slate-500">{detail}</p> : null}
    </Card>
  );
}

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }): ReactElement {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.section className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-3xl border border-white/10 bg-[#101827] p-6 shadow-2xl" initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Close dialog"><X size={18} /></Button>
        </div>
        {children}
      </motion.section>
    </motion.div>
  );
}

export function ProgressRing({ value }: { value: number }): ReactElement {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div className="relative h-28 w-28">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r="52" stroke="#20293A" strokeWidth="10" fill="none" />
        <motion.circle cx="60" cy="60" r="52" stroke="url(#progress-gradient)" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={327} animate={{ strokeDashoffset: 327 - (327 * safe) / 100 }} />
        <defs>
          <linearGradient id="progress-gradient" x1="0" x2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">{safe.toFixed(0)}%</div>
    </div>
  );
}
