import { NextRequest, NextResponse } from "next/server";
import {
  getTegakanList,
  createTegakan,
  generateKodeTegakan,
} from "@/lib/tegakan/service";
import { tegakanSchema } from "@/lib/tegakan/types";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      spesies: searchParams.get("spesies") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
      sortOrder: (searchParams.get("sortOrder") ?? "asc") as "asc" | "desc",
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit")
        ? Number(searchParams.get("limit"))
        : 10,
    };

    const result = await getTegakanList(params);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data tegakan" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = tegakanSchema.parse(body);

    const supabase = await createClient();
    const { data: area } = await supabase
      .from("area_monitoring")
      .select("nama")
      .eq("id", validated.area_id)
      .single();

    const zonaNama = (area as { nama?: string } | null)?.nama ?? "";
    const kode_tegakan = await generateKodeTegakan(zonaNama);

    const record = await createTegakan({
      kode_tegakan,
      tanggal: validated.tanggal,
      area_id: validated.area_id,
      latitude: validated.latitude,
      longitude: validated.longitude,
      spesies: validated.spesies,
      health_status: validated.health_status,
      foto_url: body.foto_url ?? null,
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
    const message = err instanceof Error ? err.message : "Gagal membuat tegakan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
