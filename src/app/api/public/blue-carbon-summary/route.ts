import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const [calcRes, tegakanRes] = await Promise.all([
      supabase
        .from("blue_carbon_calculations")
        .select("karbon_kg, co2_ekuivalen, area_ha")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.from("tegakan").select("health_status"),
    ]);

    const calculations = calcRes.data ?? [];
    const tegakan = tegakanRes.data ?? [];

    const totalKarbon = calculations.reduce((s, c) => s + (c.karbon_kg ?? 0), 0);
    const totalCo2e = calculations.reduce((s, c) => s + (c.co2_ekuivalen ?? 0), 0);
    const totalAreaHa = calculations.reduce((s, c) => s + (c.area_ha ?? 0), 0);
    const totalTegakan = tegakan.length;
    const tegankanHidup = tegakan.filter((t) => t.health_status === "hidup").length;
    const survivalRate = totalTegakan > 0 ? Math.round((tegankanHidup / totalTegakan) * 100) : 0;

    return NextResponse.json({
      totalKarbon: Math.round(totalKarbon * 100) / 100,
      totalCo2e: Math.round(totalCo2e * 100) / 100,
      totalAreaHa: Math.round(totalAreaHa * 100) / 100,
      totalTegakan,
      tegankanHidup,
      survivalRate,
      // Comparison: mangrove vs rainforest (from IPCC data)
      comparison: [
        { name: "Hutan Mangrove Pesisir", value: 1000, unit: "ton C/ha", color: "#10b981" },
        { name: "Hutan Hujan Tropis Daratan", value: 120, unit: "ton C/ha", color: "#6b7280" },
      ],
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data blue carbon" },
      { status: 500 }
    );
  }
}
