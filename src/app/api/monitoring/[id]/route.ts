import { NextRequest, NextResponse } from "next/server";
import {
  getMonitoringById,
  updateMonitoring,
  deleteMonitoring,
} from "@/lib/monitoring/service";
import { monitoringSchema } from "@/lib/monitoring/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await getMonitoringById(id);

    if (!record) {
      return NextResponse.json(
        { error: "Data monitoring tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data monitoring" },
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
    const validated = monitoringSchema.parse(body);

    const record = await updateMonitoring(id, {
      tanggal: validated.tanggal,
      tinggi_cm: validated.tinggi_cm,
      diameter_cm: validated.diameter_cm ?? null,
      health_status: validated.health_status,
      catatan: validated.catatan ?? null,
      foto_url: body.foto_url ?? null,
    });

    if (!record) {
      return NextResponse.json(
        { error: "Data monitoring tidak ditemukan" },
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
      err instanceof Error ? err.message : "Gagal mengupdate monitoring";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteMonitoring(id);
    return NextResponse.json({ message: "Monitoring berhasil dihapus" });
  } catch {
    return NextResponse.json(
      { error: "Gagal menghapus monitoring" },
      { status: 500 }
    );
  }
}
