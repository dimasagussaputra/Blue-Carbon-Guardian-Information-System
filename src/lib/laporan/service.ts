import { createClient } from "@/lib/supabase/server";
import type { LaporanConfig, LaporanData } from "./types";
import type { TegakanRecord } from "@/lib/tegakan/types";
import { transformTegakanRow } from "@/lib/tegakan/types";
import type { MonitoringRecord } from "@/lib/monitoring/types";
import { transformMonitoringRow } from "@/lib/monitoring/types";
import type { PenyulamanRecord } from "@/lib/penyulaman/types";
import { transformPenyulamanRow } from "@/lib/penyulaman/types";
import type { KualitasAirRecord } from "@/lib/kualitas-air/types";
import { transformKualitasAirRow } from "@/lib/kualitas-air/types";
import type { BlueCarbonRecord } from "@/lib/blue-carbon/types";
import { transformBlueCarbonRow } from "@/lib/blue-carbon/types";
import type {
  DashboardKPI,
  SurvivalRatePoint,
  PenyulamanPoint,
  SpeciesItem,
  WaterQualityPoint,
  MonitoringActivityPoint,
} from "@/lib/dashboard/types";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function getFallbackData(start: string, end: string): LaporanData {
  return {
    periode: { start, end },
    kpi: {
      totalTegakan: 0,
      tegankanHidup: 0,
      tegankanMati: 0,
      survivalRate: 0,
      totalPenyulaman: 0,
      totalSamplingAir: 0,
      totalBlueCarbon: 0,
      totalMonitoring: 0,
      totalArea: 0,
    },
    survivalRateTrend: [],
    penyulamanPerBulan: [],
    speciesDistribution: [],
    waterQualityTrend: [],
    monitoringActivity: [],
    tegakan: [],
    monitoringRecords: [],
    penyulamanRecords: [],
    kualitasAirRecords: [],
    blueCarbonRecords: [],
  };
}

export async function getLaporanData(
  config: LaporanConfig
): Promise<LaporanData> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      return getFallbackData(config.startDate, config.endDate);
    }

    const { startDate, endDate, sections } = config;

    const fallbackKPI = getFallbackData(startDate, endDate).kpi;

    const kpiPromise = sections.statistik ? getKPI(supabase, startDate, endDate) : Promise.resolve(fallbackKPI);
    const survivalPromise = sections.statistik ? getSurvivalRateTrend(supabase, startDate, endDate) : Promise.resolve([]);
    const penyulamanBulanPromise = sections.statistik ? getPenyulamanPerBulan(supabase, startDate, endDate) : Promise.resolve([]);
    const speciesPromise = sections.statistik ? getSpeciesDistribution(supabase) : Promise.resolve([]);
    const waterPromise = sections.statistik ? getWaterQualityTrend(supabase, startDate, endDate) : Promise.resolve([]);
    const activityPromise = sections.statistik ? getMonitoringActivity(supabase, startDate, endDate) : Promise.resolve([]);
    const tegakanPromise = sections.inventarisasi ? getTegakanAll(supabase) : Promise.resolve([]);
    const monitoringPromise = sections.monitoring ? getMonitoringAll(supabase, startDate, endDate) : Promise.resolve([]);
    const penyulamanPromise = sections.monitoring ? getPenyulamanAll(supabase, startDate, endDate) : Promise.resolve([]);
    const kualitasPromise = sections.monitoring ? getKualitasAirAll(supabase, startDate, endDate) : Promise.resolve([]);
    const blueCarbonPromise = sections.blueCarbon ? getBlueCarbonAll(supabase, startDate, endDate) : Promise.resolve([]);

    const [
      kpi,
      survivalRateTrend,
      penyulamanPerBulan,
      speciesDistribution,
      waterQualityTrend,
      monitoringActivity,
      tegakan,
      monitoringRecords,
      penyulamanRecords,
      kualitasAirRecords,
      blueCarbonRecords,
    ] = await Promise.all([
      kpiPromise,
      survivalPromise,
      penyulamanBulanPromise,
      speciesPromise,
      waterPromise,
      activityPromise,
      tegakanPromise,
      monitoringPromise,
      penyulamanPromise,
      kualitasPromise,
      blueCarbonPromise,
    ]);

    return {
      periode: { start: startDate, end: endDate },
      kpi,
      survivalRateTrend,
      penyulamanPerBulan,
      speciesDistribution,
      waterQualityTrend,
      monitoringActivity,
      tegakan,
      monitoringRecords,
      penyulamanRecords,
      kualitasAirRecords,
      blueCarbonRecords,
    };
  } catch (err) {
    console.error("Laporan service error:", err);
    return getFallbackData(config.startDate, config.endDate);
  }
}

async function getKPI(
  supabase: Awaited<ReturnType<typeof createClient>>,
  startDate: string,
  endDate: string
): Promise<DashboardKPI> {
  const { data: tegakan } = await supabase.from("tegakan").select("health_status");
  const { count: totalPenyulaman } = await supabase
    .from("penyulaman")
    .select("*", { count: "exact", head: true })
    .gte("tanggal", startDate)
    .lte("tanggal", endDate);
  const { count: totalSamplingAir } = await supabase
    .from("kualitas_air")
    .select("*", { count: "exact", head: true })
    .gte("tanggal", startDate)
    .lte("tanggal", endDate);
  const { data: blueCarbon } = await supabase
    .from("blue_carbon_calculations")
    .select("karbon_kg")
    .gte("created_at", startDate)
    .lte("created_at", endDate);
  const { count: totalMonitoring } = await supabase
    .from("monitoring")
    .select("*", { count: "exact", head: true })
    .gte("tanggal", startDate)
    .lte("tanggal", endDate);
  const { count: totalArea } = await supabase.from("area_monitoring").select("*", { count: "exact", head: true });

  if (!tegakan || tegakan.length === 0) {
    return {
      totalTegakan: 0,
      tegankanHidup: 0,
      tegankanMati: 0,
      survivalRate: 0,
      totalPenyulaman: totalPenyulaman ?? 0,
      totalSamplingAir: totalSamplingAir ?? 0,
      totalBlueCarbon: 0,
      totalMonitoring: totalMonitoring ?? 0,
      totalArea: totalArea ?? 0,
    };
  }

  const totalTegakan = tegakan.length;
  const tegankanHidup = tegakan.filter((t) => t.health_status === "hidup").length;
  const tegankanMati = tegakan.filter((t) => t.health_status === "mati").length;
  const survivalRate = totalTegakan > 0 ? Math.round((tegankanHidup / totalTegakan) * 100) : 0;
  const totalBlueCarbon = blueCarbon
    ? blueCarbon.reduce((sum, b) => sum + (b.karbon_kg ?? 0), 0)
    : 0;

  return {
    totalTegakan,
    tegankanHidup,
    tegankanMati,
    survivalRate,
    totalPenyulaman: totalPenyulaman ?? 0,
    totalSamplingAir: totalSamplingAir ?? 0,
    totalBlueCarbon: Math.round(totalBlueCarbon * 100) / 100,
    totalMonitoring: totalMonitoring ?? 0,
    totalArea: totalArea ?? 0,
  };
}

async function getSurvivalRateTrend(
  supabase: Awaited<ReturnType<typeof createClient>>,
  startDate: string,
  endDate: string
): Promise<SurvivalRatePoint[]> {
  const { data: monitoring } = await supabase
    .from("monitoring")
    .select("tanggal, survia")
    .gte("tanggal", startDate)
    .lte("tanggal", endDate)
    .order("tanggal", { ascending: true });

  if (!monitoring || monitoring.length === 0) return [];

  const monthly: Record<string, { total: number; hidup: number }> = {};

  for (const m of monitoring) {
    const key = MONTHS[new Date(m.tanggal).getMonth()];
    if (!monthly[key]) monthly[key] = { total: 0, hidup: 0 };
    monthly[key].total += 1;
    if (m.survia === true) monthly[key].hidup += 1;
  }

  return Object.entries(monthly).map(([bulan, data]) => ({
    bulan,
    rate: data.total > 0 ? Math.round((data.hidup / data.total) * 100) : 0,
    total: data.total,
    hidup: data.hidup,
  }));
}

async function getPenyulamanPerBulan(
  supabase: Awaited<ReturnType<typeof createClient>>,
  startDate: string,
  endDate: string
): Promise<PenyulamanPoint[]> {
  const { data: penyulaman } = await supabase
    .from("penyulaman")
    .select("tanggal, jumlah_bibit")
    .gte("tanggal", startDate)
    .lte("tanggal", endDate)
    .order("tanggal", { ascending: true });

  if (!penyulaman || penyulaman.length === 0) return [];

  const monthly: Record<string, { jumlah: number; bibit: number }> = {};

  for (const p of penyulaman) {
    const key = MONTHS[new Date(p.tanggal).getMonth()];
    if (!monthly[key]) monthly[key] = { jumlah: 0, bibit: 0 };
    monthly[key].jumlah += 1;
    monthly[key].bibit += p.jumlah_bibit;
  }

  return Object.entries(monthly).map(([bulan, data]) => ({
    bulan,
    jumlah: data.jumlah,
    bibit: data.bibit,
  }));
}

async function getSpeciesDistribution(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<SpeciesItem[]> {
  const { data: tegakan } = await supabase.from("tegakan").select("spesies");
  if (!tegakan || tegakan.length === 0) return [];

  const SPECIES_COLORS: Record<string, string> = {
    "Rhizophora mucronata": "#10b981",
    "Avicennia marina": "#3498db",
    "Sonneratia alba": "#f59e0b",
    "Rhizophora apiculata": "#8b5cf6",
    "Bruguiera gymnorhiza": "#ef4444",
  };

  const grouped: Record<string, number> = {};
  for (const t of tegakan) grouped[t.spesies] = (grouped[t.spesies] ?? 0) + 1;

  return Object.entries(grouped).map(([name, value]) => ({
    name: name
      .replace("Rhizophora", "R.")
      .replace("Avicennia", "A.")
      .replace("Sonneratia", "S.")
      .replace("Bruguiera", "B."),
    value,
    color: SPECIES_COLORS[name] ?? "#6b7280",
  }));
}

async function getWaterQualityTrend(
  supabase: Awaited<ReturnType<typeof createClient>>,
  startDate: string,
  endDate: string
): Promise<WaterQualityPoint[]> {
  const { data: kualitas } = await supabase
    .from("kualitas_air")
    .select("tanggal, ph, do_mgl, salinitas_ppt, tss_mgl, suhu_c")
    .gte("tanggal", startDate)
    .lte("tanggal", endDate)
    .order("tanggal", { ascending: true });

  if (!kualitas || kualitas.length === 0) return [];

  const monthly: Record<
    string,
    { ph: number[]; do: number[]; salinitas: number[]; tss: number[]; suhu: number[] }
  > = {};

  for (const k of kualitas) {
    const key = MONTHS[new Date(k.tanggal).getMonth()];
    if (!monthly[key]) monthly[key] = { ph: [], do: [], salinitas: [], tss: [], suhu: [] };
    if (k.ph != null) monthly[key].ph.push(k.ph);
    if (k.do_mgl != null) monthly[key].do.push(k.do_mgl);
    if (k.salinitas_ppt != null) monthly[key].salinitas.push(k.salinitas_ppt);
    if (k.tss_mgl != null) monthly[key].tss.push(k.tss_mgl);
    if (k.suhu_c != null) monthly[key].suhu.push(k.suhu_c);
  }

  const avg = (arr: number[]) =>
    arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 0;

  return Object.entries(monthly).map(([bulan, data]) => ({
    bulan,
    ph: avg(data.ph),
    do: avg(data.do),
    salinitas: avg(data.salinitas),
    tss: avg(data.tss),
    suhu: avg(data.suhu),
  }));
}

async function getMonitoringActivity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  startDate: string,
  endDate: string
): Promise<MonitoringActivityPoint[]> {
  const { data: monitoring } = await supabase
    .from("monitoring")
    .select("tanggal")
    .gte("tanggal", startDate)
    .lte("tanggal", endDate);

  const { data: penyulaman } = await supabase
    .from("penyulaman")
    .select("tanggal")
    .gte("tanggal", startDate)
    .lte("tanggal", endDate);

  const monthly: Record<string, { monitoring: number; penyulaman: number }> = {};

  for (const m of monitoring ?? []) {
    const key = MONTHS[new Date(m.tanggal).getMonth()];
    if (!monthly[key]) monthly[key] = { monitoring: 0, penyulaman: 0 };
    monthly[key].monitoring += 1;
  }

  for (const p of penyulaman ?? []) {
    const key = MONTHS[new Date(p.tanggal).getMonth()];
    if (!monthly[key]) monthly[key] = { monitoring: 0, penyulaman: 0 };
    monthly[key].penyulaman += 1;
  }

  return Object.entries(monthly).map(([bulan, data]) => ({
    bulan,
    monitoring: data.monitoring,
    penyulaman: data.penyulaman,
  }));
}

async function getTegakanAll(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<TegakanRecord[]> {
  const { data } = await supabase
    .from("tegakan")
    .select("*, area_monitoring(nama)")
    .order("kode_tegakan", { ascending: true });

  return ((data ?? []) as Record<string, unknown>[]).map(transformTegakanRow);
}

async function getMonitoringAll(
  supabase: Awaited<ReturnType<typeof createClient>>,
  startDate: string,
  endDate: string
): Promise<MonitoringRecord[]> {
  const { data } = await supabase
    .from("monitoring")
    .select("*, tegakan(kode_tegakan)")
    .gte("tanggal", startDate)
    .lte("tanggal", endDate)
    .order("tanggal", { ascending: false });

  return ((data ?? []) as Record<string, unknown>[]).map(transformMonitoringRow);
}

async function getPenyulamanAll(
  supabase: Awaited<ReturnType<typeof createClient>>,
  startDate: string,
  endDate: string
): Promise<PenyulamanRecord[]> {
  const { data } = await supabase
    .from("penyulaman")
    .select("*")
    .gte("tanggal", startDate)
    .lte("tanggal", endDate)
    .order("tanggal", { ascending: false });

  return ((data ?? []) as Record<string, unknown>[]).map(transformPenyulamanRow);
}

async function getKualitasAirAll(
  supabase: Awaited<ReturnType<typeof createClient>>,
  startDate: string,
  endDate: string
): Promise<KualitasAirRecord[]> {
  const { data } = await supabase
    .from("kualitas_air")
    .select("*, area_monitoring(nama)")
    .gte("tanggal", startDate)
    .lte("tanggal", endDate)
    .order("tanggal", { ascending: false });

  return ((data ?? []) as Record<string, unknown>[]).map(transformKualitasAirRow);
}

async function getBlueCarbonAll(
  supabase: Awaited<ReturnType<typeof createClient>>,
  startDate: string,
  endDate: string
): Promise<BlueCarbonRecord[]> {
  const { data } = await supabase
    .from("blue_carbon_calculations")
    .select("*")
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .order("created_at", { ascending: false });

  return ((data ?? []) as Record<string, unknown>[]).map(transformBlueCarbonRow);
}
