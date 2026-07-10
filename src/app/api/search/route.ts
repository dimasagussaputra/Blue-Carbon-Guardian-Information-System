import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const supabase = await createClient();
    const term = `%${q}%`;

    const [tegakan, penyulaman, kualitas, monitoring, galeri, dokumen] = await Promise.all([
      supabase
        .from("tegakan")
        .select("id, kode_tegakan, spesies, area_monitoring(nama)")
        .or(`kode_tegakan.ilike.${term},spesies.ilike.${term}`)
        .is("deleted_at", null)
        .limit(5),
      supabase
        .from("penyulaman")
        .select("id, spesies, tanggal, keterangan")
        .or(`spesies.ilike.${term},keterangan.ilike.${term}`)
        .is("deleted_at", null)
        .limit(5),
      supabase
        .from("kualitas_air")
        .select("id, titik_sampling, tanggal")
        .or(`titik_sampling.ilike.${term}`)
        .is("deleted_at", null)
        .limit(5),
      supabase
        .from("monitoring")
        .select("id, catatan, tanggal, tegakan(kode_tegakan)")
        .or(`catatan.ilike.${term},tegakan.kode_tegakan.ilike.${term}`)
        .is("deleted_at", null)
        .limit(5),
      supabase
        .from("galeri")
        .select("id, judul, deskripsi")
        .or(`judul.ilike.${term},deskripsi.ilike.${term}`)
        .is("deleted_at", null)
        .limit(5),
      supabase
        .from("dokumen")
        .select("id, nama, deskripsi")
        .or(`nama.ilike.${term},deskripsi.ilike.${term}`)
        .is("deleted_at", null)
        .limit(5),
    ]);

    type SearchResult = { id: string; label: string; sublabel: string; href: string; type: string };

    const results: SearchResult[] = [
      ...(tegakan.data ?? []).map((t) => {
        const area = t.area_monitoring as { nama?: string } | null;
        return {
          id: t.id,
          label: t.kode_tegakan,
          sublabel: [t.spesies, area?.nama].filter(Boolean).join(" — "),
          href: `/admin/inventarisasi-tegakan`,
          type: "Tegakan" as const,
        };
      }),
      ...(penyulaman.data ?? []).map((p) => ({
        id: p.id,
        label: p.spesies,
        sublabel: p.tanggal ?? "",
        href: `/admin/penyulaman`,
        type: "Penyulaman" as const,
      })),
      ...(kualitas.data ?? []).map((k) => ({
        id: k.id,
        label: k.titik_sampling,
        sublabel: k.tanggal ?? "",
        href: `/admin/kualitas-air`,
        type: "Kualitas Air" as const,
      })),
      ...(monitoring.data ?? []).map((m) => ({
        id: m.id,
        label: (m.tegakan as { kode_tegakan?: string } | null)?.kode_tegakan ?? "Monitoring",
        sublabel: m.catatan ?? "",
        href: `/admin/monitoring`,
        type: "Monitoring" as const,
      })),
      ...(galeri.data ?? []).map((g) => ({
        id: g.id,
        label: g.judul ?? "",
        sublabel: g.deskripsi ?? "",
        href: `/admin/galeri`,
        type: "Galeri" as const,
      })),
      ...(dokumen.data ?? []).map((d) => ({
        id: d.id,
        label: d.nama ?? "",
        sublabel: d.deskripsi ?? "",
        href: `/admin/dokumen`,
        type: "Dokumen" as const,
      })),
    ];

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
