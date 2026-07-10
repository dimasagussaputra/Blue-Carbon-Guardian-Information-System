import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title = "Tidak ada data",
  description = "Belum ada data yang tersedia untuk ditampilkan.",
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        {icon ?? <Inbox className="size-8 text-slate-300 dark:text-slate-600" />}
      </div>
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
