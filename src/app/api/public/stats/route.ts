import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const [tegakanRes, penyulamanCount, samplingCount, blueCarbonRes, monitoringCount, areaCount] =
      await Promise.all([
        supabase.from("tegakan").select("health_status"),
        supabase.from("penyulaman").select("*", { count: "exact", head: true }),
        supabase.from("kualitas_air").select("*", { count: "exact", head: true }),
        supabase.from("blue_carbon_calculations").select("co2_ekuivalen"),
        supabase.from("monitoring").select("*", { count: "exact", head: true }),
        supabase.from("area_monitoring").select("*", { count: "exact", head: true }),
      ]);

    const tegakan = tegakanRes.data ?? [];
    const totalTegakan = tegakan.length;
    const tegankanHidup = tegakan.filter((t) => t.health_status === "hidup").length;
    const survivalRate = totalTegakan > 0 ? Math.round((tegankanHidup / totalTegakan) * 100) : 0;
    const totalBlueCarbon = (blueCarbonRes.data ?? []).reduce(
      (sum, b) => sum + (b.co2_ekuivalen ?? 0), 0
    );

    return NextResponse.json({
      totalTegakan,
      tegankanHidup,
      survivalRate,
      totalPenyulaman: penyulamanCount.count ?? 0,
      totalSamplingAir: samplingCount.count ?? 0,
      totalBlueCarbon: Math.round(totalBlueCarbon * 100) / 100,
      totalMonitoring: monitoringCount.count ?? 0,
      totalArea: areaCount.count ?? 0,
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil statistik" },
      { status: 500 }
    );
  }
}
