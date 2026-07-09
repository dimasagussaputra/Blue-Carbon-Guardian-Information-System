import { NextRequest, NextResponse } from "next/server";
import { getGaleriList } from "@/lib/galeri/service";
import type { KategoriGaleri } from "@/lib/galeri/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get("kategori") as KategoriGaleri | "";

    const result = await getGaleriList(kategori || undefined);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Gagal memuat data galeri" },
      { status: 500 }
    );
  }
}
