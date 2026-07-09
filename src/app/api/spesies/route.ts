import { NextResponse } from "next/server";
import { getSpesiesList } from "@/lib/spesies/service";

export async function GET() {
  try {
    const data = await getSpesiesList();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data spesies" },
      { status: 500 }
    );
  }
}
