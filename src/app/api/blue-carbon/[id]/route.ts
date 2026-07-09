import { NextRequest, NextResponse } from "next/server";
import { getBlueCarbonById, deleteBlueCarbonCalculation } from "@/lib/blue-carbon/service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await getBlueCarbonById(id);
    if (!record) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(record);
  } catch {
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteBlueCarbonCalculation(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
