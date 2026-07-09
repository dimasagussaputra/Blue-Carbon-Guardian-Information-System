export interface DashboardKPI {
  totalTegakan: number;
  tegankanHidup: number;
  tegankanMati: number;
  survivalRate: number;
  totalPenyulaman: number;
  totalSamplingAir: number;
  totalBlueCarbon: number;
  totalMonitoring: number;
  totalArea: number;
}

export interface SurvivalRatePoint {
  bulan: string;
  rate: number;
  total: number;
  hidup: number;
}

export interface PenyulamanPoint {
  bulan: string;
  jumlah: number;
  bibit: number;
}

export interface SpeciesItem {
  name: string;
  value: number;
  color: string;
}

export interface WaterQualityPoint {
  bulan: string;
  ph: number;
  do: number;
  salinitas: number;
  tss: number;
  suhu: number;
}

export interface MonitoringActivityPoint {
  bulan: string;
  monitoring: number;
  penyulaman: number;
}

export interface TegakanMarker {
  id: string;
  kode: string;
  spesies: string;
  status: string;
  lat: number;
  lng: number;
  area: string;
}

export interface DashboardData {
  kpi: DashboardKPI;
  survivalRateTrend: SurvivalRatePoint[];
  penyulamanPerBulan: PenyulamanPoint[];
  speciesDistribution: SpeciesItem[];
  waterQualityTrend: WaterQualityPoint[];
  monitoringActivity: MonitoringActivityPoint[];
  tegakanMarkers: TegakanMarker[];
}
