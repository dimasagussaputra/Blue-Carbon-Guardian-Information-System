import type {
  DashboardKPI,
  SurvivalRatePoint,
  PenyulamanPoint,
  SpeciesItem,
  WaterQualityPoint,
  MonitoringActivityPoint,
} from "@/lib/dashboard/types";
import type { TegakanRecord } from "@/lib/tegakan/types";
import type { MonitoringRecord } from "@/lib/monitoring/types";
import type { PenyulamanRecord } from "@/lib/penyulaman/types";
import type { KualitasAirRecord } from "@/lib/kualitas-air/types";
import type { BlueCarbonRecord } from "@/lib/blue-carbon/types";

export interface LaporanConfig {
  startDate: string;
  endDate: string;
  sections: {
    statistik: boolean;
    inventarisasi: boolean;
    monitoring: boolean;
    blueCarbon: boolean;
  };
  format: "pdf" | "excel";
}

export interface LaporanData {
  periode: { start: string; end: string };
  kpi: DashboardKPI;
  survivalRateTrend: SurvivalRatePoint[];
  penyulamanPerBulan: PenyulamanPoint[];
  speciesDistribution: SpeciesItem[];
  waterQualityTrend: WaterQualityPoint[];
  monitoringActivity: MonitoringActivityPoint[];
  tegakan: TegakanRecord[];
  monitoringRecords: MonitoringRecord[];
  penyulamanRecords: PenyulamanRecord[];
  kualitasAirRecords: KualitasAirRecord[];
  blueCarbonRecords: BlueCarbonRecord[];
}
