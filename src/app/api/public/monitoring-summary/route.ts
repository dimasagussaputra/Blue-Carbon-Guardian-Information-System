import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const [monitoringRes, kualitasRes, blueCarbonRes] = await Promise.all([
      supabase
        .from("monitoring")
        .select("tanggal, tinggi_cm, diameter_cm, survia, catatan, tegakan_id, tegakan(kode_tegakan, area_monitoring(nama))")
        .gte("tanggal", "2026-01-01")
        .lte("tanggal", "2026-12-31")
        .order("tanggal", { ascending: true }),
      supabase
        .from("kualitas_air")
        .select("tanggal, ph, do_mgl, salinitas_ppt, tss_mgl, suhu_c")
        .gte("tanggal", "2026-01-01")
        .lte("tanggal", "2026-12-31")
        .order("tanggal", { ascending: true }),
      supabase
        .from("blue_carbon_calculations")
        .select("co2_ekuivalen, karbon_kg, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const monitoring = monitoringRes.data ?? [];
    const kualitas = kualitasRes.data ?? [];
    const blueCarbon = blueCarbonRes.data ?? [];

    // --- Recent Activity ---
    const latestBySite: Record<string, { site: string; date: string; survia: boolean; catatan: string | null }> = {};
    for (const m of monitoring) {
      const tegakan = m.tegakan as { kode_tegakan?: string; area_monitoring?: { nama?: string } } | null;
      const siteName = tegakan?.area_monitoring?.nama ?? tegakan?.kode_tegakan ?? "Unknown";
      if (!latestBySite[siteName] || m.tanggal > latestBySite[siteName].date) {
        latestBySite[siteName] = {
          site: siteName,
          date: m.tanggal,
          survia: m.survia,
          catatan: m.catatan,
        };
      }
    }
    const recentActivity = Object.values(latestBySite)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
      .map((r) => ({
        site: r.site,
        date: new Date(r.date).toLocaleDateString("id-ID", {
          day: "numeric", month: "short", year: "numeric",
        }),
        status: r.survia ? "Sehat" : "Butuh Perhatian",
        health: r.survia ? "Sehat" : "Kritis",
      }));

    // --- Growth ---
    const avgTinggi =
      monitoring.length > 0
        ? Math.round((monitoring.reduce((s, m) => s + (m.tinggi_cm ?? 0), 0) / monitoring.length) * 10) / 10
        : 0;
    const avgDiameter =
      monitoring.length > 0
        ? Math.round((monitoring.reduce((s, m) => s + (m.diameter_cm ?? 0), 0) / monitoring.length) * 10) / 10
        : 0;
    const totalHidup = monitoring.filter((m) => m.survia === true).length;
    const survivalRate =
      monitoring.length > 0 ? Math.round((totalHidup / monitoring.length) * 100) : 0;

    // Monthly growth trend (for chart)
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const growthMonthly: Record<string, { tinggi: number[]; diameter: number[] }> = {};
    for (const m of monitoring) {
      const key = MONTHS[new Date(m.tanggal).getMonth()];
      if (!growthMonthly[key]) growthMonthly[key] = { tinggi: [], diameter: [] };
      if (m.tinggi_cm != null) growthMonthly[key].tinggi.push(m.tinggi_cm);
      if (m.diameter_cm != null) growthMonthly[key].diameter.push(m.diameter_cm);
    }
    const avg = (arr: number[]) =>
      arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 0;
    const growthTrend = Object.entries(growthMonthly).map(([bulan, data]) => ({
      bulan,
      tinggi: avg(data.tinggi),
      diameter: avg(data.diameter),
    }));

    // --- Environment ---
    const avgPh =
      kualitas.length > 0
        ? Math.round((kualitas.reduce((s, k) => s + (k.ph ?? 0), 0) / kualitas.length) * 10) / 10
        : 0;
    const avgDo =
      kualitas.length > 0
        ? Math.round((kualitas.reduce((s, k) => s + (k.do_mgl ?? 0), 0) / kualitas.length) * 10) / 10
        : 0;
    const avgSalinitas =
      kualitas.length > 0
        ? Math.round((kualitas.reduce((s, k) => s + (k.salinitas_ppt ?? 0), 0) / kualitas.length) * 10) / 10
        : 0;
    const avgTss =
      kualitas.length > 0
        ? Math.round((kualitas.reduce((s, k) => s + (k.tss_mgl ?? 0), 0) / kualitas.length) * 10) / 10
        : 0;
    const avgSuhu =
      kualitas.length > 0
        ? Math.round((kualitas.reduce((s, k) => s + (k.suhu_c ?? 0), 0) / kualitas.length) * 10) / 10
        : 0;

    // Monthly water quality trend
    const envMonthly: Record<string, { ph: number[]; do: number[]; salinitas: number[]; tss: number[]; suhu: number[] }> = {};
    for (const k of kualitas) {
      const key = MONTHS[new Date(k.tanggal).getMonth()];
      if (!envMonthly[key]) envMonthly[key] = { ph: [], do: [], salinitas: [], tss: [], suhu: [] };
      if (k.ph != null) envMonthly[key].ph.push(k.ph);
      if (k.do_mgl != null) envMonthly[key].do.push(k.do_mgl);
      if (k.salinitas_ppt != null) envMonthly[key].salinitas.push(k.salinitas_ppt);
      if (k.tss_mgl != null) envMonthly[key].tss.push(k.tss_mgl);
      if (k.suhu_c != null) envMonthly[key].suhu.push(k.suhu_c);
    }
    const envTrend = Object.entries(envMonthly).map(([bulan, data]) => ({
      bulan,
      ph: avg(data.ph),
      do: avg(data.do),
      salinitas: avg(data.salinitas),
      tss: avg(data.tss),
      suhu: avg(data.suhu),
    }));

    // --- Carbon ---
    const totalCo2e = blueCarbon.reduce((s, b) => s + (b.co2_ekuivalen ?? 0), 0);
    const totalKarbon = blueCarbon.reduce((s, b) => s + (b.karbon_kg ?? 0), 0);
    const avgCo2e = blueCarbon.length > 0 ? totalCo2e / blueCarbon.length : 0;
    const recentCo2e = blueCarbon.length > 0 ? (blueCarbon[0].co2_ekuivalen ?? 0) : 0;

    return NextResponse.json({
      recentActivity,
      growth: { avgTinggi, avgDiameter, survivalRate },
      growthTrend,
      environment: { avgPh, avgDo, avgSalinitas, avgTss, avgSuhu },
      envTrend,
      carbon: { totalCo2e, totalKarbon, avgCo2e, recentCo2e },
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data monitoring" },
      { status: 500 }
    );
  }
}
