import { NextRequest, NextResponse } from "next/server";
import { getDokumenList } from "@/lib/dokumen/service";
import type { KategoriDokumen } from "@/lib/dokumen/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get("kategori") as KategoriDokumen | "";

    const result = await getDokumenList(kategori || undefined);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Gagal memuat data dokumen" },
      { status: 500 }
    );
  }
}
