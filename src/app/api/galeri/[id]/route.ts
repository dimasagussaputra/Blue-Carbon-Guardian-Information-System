import { NextRequest, NextResponse } from "next/server";
import { getGaleriById, deleteGaleri, updateGaleri } from "@/lib/galeri/service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await getGaleriById(id);
    return NextResponse.json(record);
  } catch {
    return NextResponse.json(
      { error: "Foto tidak ditemukan" },
      { status: 404 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateGaleri(id, body);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Gagal memperbarui foto galeri" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteGaleri(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Gagal menghapus foto galeri" },
      { status: 500 }
    );
  }
}
