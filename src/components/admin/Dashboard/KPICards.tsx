"use client";

import { useEffect, useRef, useState } from "react";
import {
  Trees,
  Heart,
  Skull,
  Percent,
  Sprout,
  Droplets,
  Leaf,
  Map,
} from "lucide-react";
import type { DashboardKPI } from "@/lib/dashboard/types";

interface KPICardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  suffix?: string;
  color: string;
  bgColor: string;
  iconColor: string;
  decimals?: number;
}

function AnimatedCounter({
  value,
  suffix = "",
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) {
      setDisplay(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1000;
          const steps = 30;
          const stepTime = duration / steps;
          let current = 0;
          const increment = value / steps;

          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setDisplay(value);
              clearInterval(timer);
            } else {
              setDisplay(current);
            }
          }, stepTime);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

function KPICard({ label, value, icon: Icon, suffix = "", color, bgColor, iconColor, decimals = 0 }: KPICardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 dark:border-slate-700/80 dark:bg-slate-800`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {label}
          </p>
          <p className={`truncate text-lg font-bold tracking-tight sm:text-xl xl:text-2xl ${color}`}
            title={value.toLocaleString("id-ID") + suffix}>
            <AnimatedCounter value={value} suffix={suffix} decimals={decimals} />
          </p>
        </div>
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${bgColor}`}>
          <Icon className={`size-5 ${iconColor}`} />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 transition-opacity group-hover:opacity-20" />
    </div>
  );
}

interface KPICardsProps {
  data: DashboardKPI;
}

export default function KPICards({ data }: KPICardsProps) {
  const cards: KPICardProps[] = [
    {
      label: "Total Tegakan",
      value: data.totalTegakan,
      icon: Trees,
      color: "text-brand-blue-dark dark:text-brand-blue-light",
      bgColor: "bg-brand-blue-light/10",
      iconColor: "text-brand-blue-light",
    },
    {
      label: "Hidup",
      value: data.tegankanHidup,
      icon: Heart,
      color: "text-brand-green-dark dark:text-brand-green-light",
      bgColor: "bg-brand-green-light/10",
      iconColor: "text-brand-green-medium",
    },
    {
      label: "Mati",
      value: data.tegankanMati,
      icon: Skull,
      color: "text-red-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-500",
    },
    {
      label: "Survival Rate",
      value: data.survivalRate,
      icon: Percent,
      suffix: "%",
      color: "text-brand-green-dark dark:text-brand-green-light",
      bgColor: "bg-brand-green-medium/10",
      iconColor: "text-brand-green-medium",
      decimals: 0,
    },
    {
      label: "Penyulaman",
      value: data.totalPenyulaman,
      icon: Sprout,
      color: "text-emerald-700 dark:text-emerald-300",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
    {
      label: "Sampling Air",
      value: data.totalSamplingAir,
      icon: Droplets,
      color: "text-sky-700 dark:text-sky-300",
      bgColor: "bg-sky-50",
      iconColor: "text-sky-500",
    },
    {
      label: "Blue Carbon",
      value: data.totalBlueCarbon,
      icon: Leaf,
      suffix: " kg",
      color: "text-teal-700 dark:text-teal-300",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-500",
      decimals: 1,
    },
    {
      label: "Area Monitoring",
      value: data.totalArea,
      icon: Map,
      suffix: " zona",
      color: "text-indigo-700 dark:text-indigo-300",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:gap-5">
      {cards.map((card) => (
        <KPICard key={card.label} {...card} />
      ))}
    </div>
  );
}
