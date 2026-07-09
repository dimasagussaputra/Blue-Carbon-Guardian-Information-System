import { NextRequest, NextResponse } from "next/server";
import {
  getPenyulamanList,
  createPenyulaman,
  getPenyulamanStats,
} from "@/lib/penyulaman/service";
import { penyulamanSchema } from "@/lib/penyulaman/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stats = searchParams.get("stats");

    if (stats === "true") {
      const gelombang = searchParams.get("gelombang") ?? undefined;
      const result = await getPenyulamanStats(gelombang);
      return NextResponse.json(result);
    }

    const params = {
      search: searchParams.get("search") ?? undefined,
      gelombang: searchParams.get("gelombang") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
      sortOrder: (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc",
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 10,
    };

    const result = await getPenyulamanList(params);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data penyulaman" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = penyulamanSchema.parse(body);

    const record = await createPenyulaman({
      tanggal: validated.tanggal,
      gelombang: validated.gelombang,
      spesies: validated.spesies,
      jumlah_bibit: validated.jumlah_bibit,
      jumlah_hidup: validated.jumlah_hidup ?? null,
      latitude: validated.latitude,
      longitude: validated.longitude,
      foto_url: body.foto_url ?? null,
      status: validated.status,
      keterangan: validated.keterangan ?? null,
    });

    return NextResponse.json(record, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && "issues" in err) {
      const zodError = err as { issues: Array<{ message: string }> };
      return NextResponse.json(
        { error: "Validasi gagal", details: zodError.issues },
        { status: 400 }
      );
    }
    const message =
      err instanceof Error ? err.message : "Gagal membuat data penyulaman";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
