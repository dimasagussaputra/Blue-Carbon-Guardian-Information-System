import { NextRequest, NextResponse } from "next/server";
import {
  getKualitasAirById,
  updateKualitasAir,
  deleteKualitasAir,
} from "@/lib/kualitas-air/service";
import { kualitasAirSchema } from "@/lib/kualitas-air/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await getKualitasAirById(id);

    if (!record) {
      return NextResponse.json(
        { error: "Data kualitas air tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data kualitas air" },
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
    const validated = kualitasAirSchema.parse(body);

    const record = await updateKualitasAir(id, {
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

    if (!record) {
      return NextResponse.json(
        { error: "Data kualitas air tidak ditemukan" },
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
    const message =
      err instanceof Error
        ? err.message
        : "Gagal mengupdate data kualitas air";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteKualitasAir(id);
    return NextResponse.json({
      message: "Data kualitas air berhasil dihapus",
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal menghapus data kualitas air" },
      { status: 500 }
    );
  }
}
