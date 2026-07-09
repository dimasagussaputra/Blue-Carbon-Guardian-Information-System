import { NextRequest, NextResponse } from "next/server";
import {
  getKualitasAirList,
  createKualitasAir,
  getKualitasAirTrend,
  getKualitasAirComparison,
} from "@/lib/kualitas-air/service";
import { kualitasAirSchema } from "@/lib/kualitas-air/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trend = searchParams.get("trend");
    const comparison = searchParams.get("comparison");

    if (trend === "true") {
      const result = await getKualitasAirTrend(
        searchParams.get("area_id") ?? undefined,
        searchParams.get("start_date") ?? undefined,
        searchParams.get("end_date") ?? undefined
      );
      return NextResponse.json(result);
    }

    if (comparison === "true") {
      const result = await getKualitasAirComparison(
        searchParams.get("start_date") ?? undefined,
        searchParams.get("end_date") ?? undefined
      );
      return NextResponse.json(result);
    }

    const params = {
      search: searchParams.get("search") ?? undefined,
      area_id: searchParams.get("area_id") ?? undefined,
      start_date: searchParams.get("start_date") ?? undefined,
      end_date: searchParams.get("end_date") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
      sortOrder: (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc",
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 10,
    };

    const result = await getKualitasAirList(params);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data kualitas air" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = kualitasAirSchema.parse(body);

    const record = await createKualitasAir({
      tanggal: validated.tanggal,
      area_id: validated.area_id,
      titik_sampling: validated.titik_sampling ?? null,
      ph: validated.ph,
      do_mgl: validated.do_mgl,
      salinitas_ppt: validated.salinitas_ppt,
      tss_mgl: validated.tss_mgl,
      suhu_c: validated.suhu_c,
      latitude: validated.latitude,
      longitude: validated.longitude,
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
      err instanceof Error
        ? err.message
        : "Gagal membuat data kualitas air";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
