import { NextRequest, NextResponse } from "next/server";
import { deleteGaleri } from "@/lib/galeri/service";

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
