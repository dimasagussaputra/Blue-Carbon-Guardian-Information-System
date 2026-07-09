"use client";

import {
  Activity,
  BarChart3,
  Droplets,
  Map,
  PieChart,
  Sprout,
  TrendingUp,
} from "lucide-react";
import type { DashboardData } from "@/lib/dashboard/types";
import KPICards from "./KPICards";
import SurvivalRateChart from "./SurvivalRateChart";
import PenyulamanChart from "./PenyulamanChart";
import SpeciesPieChart from "./SpeciesPieChart";
import WaterQualityChart from "./WaterQualityChart";
import MonitoringActivityChart from "./MonitoringActivityChart";
import MapPreview from "./MapPreview";
import QuickActions from "./QuickActions";

interface DashboardPageProps {
  data: DashboardData;
}

function ChartCard({
  title,
  icon: Icon,
  children,
  colSpan = "lg:col-span-1",
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  colSpan?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-800 ${colSpan}`}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
          <Icon className="size-4 text-slate-500 dark:text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function DashboardPage({ data }: DashboardPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Ringkasan data monitoring kawasan mangrove Mangkang
          </p>
        </div>
        <QuickActions />
      </div>

      <KPICards data={data.kpi} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard
          title="Tren Survival Rate"
          icon={TrendingUp}
          colSpan="lg:col-span-2"
        >
          <SurvivalRateChart data={data.survivalRateTrend} />
        </ChartCard>
        <ChartCard title="Penyulaman per Bulan" icon={Sprout}>
          <PenyulamanChart data={data.penyulamanPerBulan} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard title="Distribusi Spesies" icon={PieChart}>
          <SpeciesPieChart data={data.speciesDistribution} />
        </ChartCard>
        <ChartCard
          title="Tren Kualitas Air"
          icon={Droplets}
          colSpan="lg:col-span-2"
        >
          <WaterQualityChart data={data.waterQualityTrend} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard title="Aktivitas Monitoring" icon={BarChart3}>
          <MonitoringActivityChart data={data.monitoringActivity} />
        </ChartCard>
        <ChartCard
          title="Peta Tegakan"
          icon={Map}
          colSpan="lg:col-span-2"
        >
          <MapPreview markers={data.tegakanMarkers} />
        </ChartCard>
      </div>
    </div>
  );
}
