import { NextRequest, NextResponse } from "next/server";
import { deleteDokumen } from "@/lib/dokumen/service";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteDokumen(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Gagal menghapus dokumen" },
      { status: 500 }
    );
  }
}
