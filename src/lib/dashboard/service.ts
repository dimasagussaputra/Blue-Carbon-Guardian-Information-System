import { createClient } from "@/lib/supabase/server";
import type {
  DashboardData,
  DashboardKPI,
  SurvivalRatePoint,
  PenyulamanPoint,
  SpeciesItem,
  WaterQualityPoint,
  MonitoringActivityPoint,
  TegakanMarker,
} from "./types";

function getFallbackDashboardData(): DashboardData {
  return {
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
    tegakanMarkers: [],
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      return getFallbackDashboardData();
    }

    const [kpi, survivalRateTrend, penyulamanPerBulan, speciesDist, waterQuality, monitoringActivity, markers] =
      await Promise.all([
        getKPI(supabase),
        getSurvivalRateTrend(supabase),
        getPenyulamanPerBulan(supabase),
        getSpeciesDistribution(supabase),
        getWaterQualityTrend(supabase),
        getMonitoringActivity(supabase),
        getTegakanMarkers(supabase),
      ]);

    return {
      kpi,
      survivalRateTrend,
      penyulamanPerBulan,
      speciesDistribution: speciesDist,
      waterQualityTrend: waterQuality,
      monitoringActivity,
      tegakanMarkers: markers,
    };
  } catch (err) {
    console.error("Dashboard service error:", err);
    return getFallbackDashboardData();
  }
}

async function getKPI(supabase: Awaited<ReturnType<typeof createClient>>): Promise<DashboardKPI> {
  const { data: tegakan } = await supabase.from("tegakan").select("health_status");
  const { count: totalPenyulaman } = await supabase.from("penyulaman").select("*", { count: "exact", head: true });
  const { count: totalSamplingAir } = await supabase.from("kualitas_air").select("*", { count: "exact", head: true });
  const { data: blueCarbon } = await supabase.from("blue_carbon_calculations").select("karbon_kg");
  const { count: totalMonitoring } = await supabase.from("monitoring").select("*", { count: "exact", head: true });
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
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<SurvivalRatePoint[]> {
  const { data: monitoring } = await supabase
    .from("monitoring")
    .select("tanggal, survia")
    .gte("tanggal", "2026-01-01")
    .lte("tanggal", "2026-12-31")
    .order("tanggal", { ascending: true });

  if (!monitoring || monitoring.length === 0) return [];

  const monthly: Record<string, { total: number; hidup: number; done: boolean }> = {};
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  for (const m of monitoring) {
    const date = new Date(m.tanggal);
    const key = MONTHS[date.getMonth()];
    if (!monthly[key]) {
      monthly[key] = { total: 0, hidup: 0, done: false };
    }
    monthly[key].total += 1;
    if (m.survia === true) {
      monthly[key].hidup += 1;
    }
  }

  return Object.entries(monthly).map(([bulan, data]) => ({
    bulan,
    rate: data.total > 0 ? Math.round((data.hidup / data.total) * 100) : 0,
    total: data.total,
    hidup: data.hidup,
  }));
}

async function getPenyulamanPerBulan(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<PenyulamanPoint[]> {
  const { data: penyulaman } = await supabase
    .from("penyulaman")
    .select("tanggal, jumlah_bibit")
    .gte("tanggal", "2026-01-01")
    .lte("tanggal", "2026-12-31")
    .order("tanggal", { ascending: true });

  if (!penyulaman || penyulaman.length === 0) return [];

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const monthly: Record<string, { jumlah: number; bibit: number }> = {};

  for (const p of penyulaman) {
    const key = MONTHS[new Date(p.tanggal).getMonth()];
    if (!monthly[key]) {
      monthly[key] = { jumlah: 0, bibit: 0 };
    }
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
  for (const t of tegakan) {
    grouped[t.spesies] = (grouped[t.spesies] ?? 0) + 1;
  }

  return Object.entries(grouped).map(([name, value]) => ({
    name: name.replace("Rhizophora", "R.").replace("Avicennia", "A.").replace("Sonneratia", "S.").replace("Bruguiera", "B."),
    value,
    color: SPECIES_COLORS[name] ?? "#6b7280",
  }));
}

async function getWaterQualityTrend(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<WaterQualityPoint[]> {
  const { data: kualitas } = await supabase
    .from("kualitas_air")
    .select("tanggal, ph, do_mgl, salinitas_ppt, tss_mgl, suhu_c")
    .gte("tanggal", "2026-01-01")
    .lte("tanggal", "2026-12-31")
    .order("tanggal", { ascending: true });

  if (!kualitas || kualitas.length === 0) return [];

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const monthly: Record<string, { ph: number[]; do: number[]; salinitas: number[]; tss: number[]; suhu: number[] }> = {};

  for (const k of kualitas) {
    const key = MONTHS[new Date(k.tanggal).getMonth()];
    if (!monthly[key]) {
      monthly[key] = { ph: [], do: [], salinitas: [], tss: [], suhu: [] };
    }
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
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<MonitoringActivityPoint[]> {
  const { data: monitoring } = await supabase
    .from("monitoring")
    .select("tanggal")
    .gte("tanggal", "2026-01-01")
    .lte("tanggal", "2026-12-31")
    .order("tanggal", { ascending: true });

  const { data: penyulaman } = await supabase
    .from("penyulaman")
    .select("tanggal")
    .gte("tanggal", "2026-01-01")
    .lte("tanggal", "2026-12-31")
    .order("tanggal", { ascending: true });

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
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

async function getTegakanMarkers(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<TegakanMarker[]> {
  const { data: tegakan } = await supabase
    .from("tegakan")
    .select("id, kode_tegakan, spesies, health_status, latitude, longitude, area_monitoring(nama)");

  if (!tegakan || tegakan.length === 0) return [];

  return tegakan
    .filter((t) => t.latitude != null && t.longitude != null)
    .map((t) => ({
      id: t.id,
      kode: t.kode_tegakan,
      spesies: t.spesies,
      status: t.health_status,
      lat: Number(t.latitude),
      lng: Number(t.longitude),
      area: (t.area_monitoring as { nama?: string } | null)?.nama ?? "",
    }));
}
