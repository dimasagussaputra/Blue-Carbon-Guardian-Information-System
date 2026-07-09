import { NextRequest, NextResponse } from "next/server";
import {
  getMonitoringList,
  createMonitoring,
} from "@/lib/monitoring/service";
import { monitoringSchema } from "@/lib/monitoring/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      tegakan_id: searchParams.get("tegakan_id") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
      sortOrder: (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc",
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit")
        ? Number(searchParams.get("limit"))
        : 10,
    };

    const result = await getMonitoringList(params);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data monitoring" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = monitoringSchema.parse(body);

    const record = await createMonitoring({
      tegakan_id: validated.tegakan_id,
      tanggal: validated.tanggal,
      tinggi_cm: validated.tinggi_cm,
      diameter_cm: validated.diameter_cm ?? null,
      health_status: validated.health_status,
      catatan: validated.catatan ?? null,
      foto_url: body.foto_url ?? null,
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
      err instanceof Error ? err.message : "Gagal membuat monitoring";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
