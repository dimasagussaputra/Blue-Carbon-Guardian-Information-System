import { NextRequest, NextResponse } from "next/server";
import { getGaleriList } from "@/lib/galeri/service";
import type { KategoriGaleri } from "@/lib/galeri/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get("kategori") as KategoriGaleri | "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "12", 10)));

    const result = await getGaleriList(kategori || undefined, page, limit);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Gagal memuat data galeri" },
      { status: 500 }
    );
  }
}
