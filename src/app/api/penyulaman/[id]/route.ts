import { NextRequest, NextResponse } from "next/server";
import {
  getPenyulamanById,
  updatePenyulaman,
  deletePenyulaman,
} from "@/lib/penyulaman/service";
import { penyulamanSchema } from "@/lib/penyulaman/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await getPenyulamanById(id);

    if (!record) {
      return NextResponse.json(
        { error: "Data penyulaman tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data penyulaman" },
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
    const validated = penyulamanSchema.parse(body);

    const record = await updatePenyulaman(id, {
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

    if (!record) {
      return NextResponse.json(
        { error: "Data penyulaman tidak ditemukan" },
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
        : "Gagal mengupdate data penyulaman";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deletePenyulaman(id);
    return NextResponse.json({ message: "Data penyulaman berhasil dihapus" });
  } catch {
    return NextResponse.json(
      { error: "Gagal menghapus data penyulaman" },
      { status: 500 }
    );
  }
}
