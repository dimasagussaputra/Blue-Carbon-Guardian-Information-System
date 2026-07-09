import { NextRequest, NextResponse } from "next/server";
import {
  getTegakanById,
  updateTegakan,
  deleteTegakan,
} from "@/lib/tegakan/service";
import { tegakanSchema } from "@/lib/tegakan/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await getTegakanById(id);

    if (!record) {
      return NextResponse.json(
        { error: "Data tegakan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data tegakan" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = tegakanSchema.parse(body);

    const record = await updateTegakan(id, {
      tanggal: validated.tanggal,
      area_id: validated.area_id,
      latitude: validated.latitude,
      longitude: validated.longitude,
      spesies: validated.spesies,
      health_status: validated.health_status,
      foto_url: body.foto_url ?? null,
      keterangan: body.keterangan ?? null,
    });

    if (!record) {
      return NextResponse.json(
        { error: "Data tegakan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch (err: unknown) {
    if (err instanceof Error && "issues" in err) {
      const zodError = err as { issues: Array<{ message: string }> };
      return NextResponse.json(
        { error: "Validasi gagal", details: zodError.issues },
        { status: 400 }
      );
    }
    const message = err instanceof Error ? err.message : "Gagal mengupdate tegakan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteTegakan(id);
    return NextResponse.json({ message: "Tegakan berhasil dihapus" });
  } catch {
    return NextResponse.json(
      { error: "Gagal menghapus tegakan" },
      { status: 500 }
    );
  }
}
