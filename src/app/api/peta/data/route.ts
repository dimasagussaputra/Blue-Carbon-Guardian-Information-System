import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const [tegakanRes, penyulamanRes, kualitasRes] = await Promise.all([
      supabase
        .from("tegakan")
        .select("id, kode_tegakan, spesies, health_status, tinggi_cm, diameter_cm, latitude, longitude, area_monitoring(nama)")
        .is("deleted_at", null),
      supabase
        .from("penyulaman")
        .select("id, tanggal, spesies, jumlah_bibit, jumlah_hidup, status, latitude, longitude")
        .is("deleted_at", null),
      supabase
        .from("kualitas_air")
        .select("id, tanggal, titik_sampling, ph, do_mgl, salinitas_ppt, tss_mgl, suhu_c, latitude, longitude, area_monitoring(nama)")
        .is("deleted_at", null),
    ]);

    return NextResponse.json({
      tegakan: tegakanRes.data ?? [],
      penyulaman: penyulamanRes.data ?? [],
      kualitas_air: kualitasRes.data ?? [],
    });
  } catch {
    return NextResponse.json(
      { tegakan: [], penyulaman: [], kualitas_air: [] },
      { status: 500 }
    );
  }
}
