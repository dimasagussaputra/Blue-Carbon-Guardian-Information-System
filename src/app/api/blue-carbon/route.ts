import { NextRequest, NextResponse } from "next/server";
import { calculateBlueCarbon } from "@/lib/blue-carbon/calculator";
import { saveBlueCarbonCalculation, getBlueCarbonHistory } from "@/lib/blue-carbon/service";
import { blueCarbonInputSchema } from "@/lib/blue-carbon/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");

    const result = await getBlueCarbonHistory({ page, limit });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Gagal memuat riwayat" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = blueCarbonInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", detail: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { lokasi, ...input } = parsed.data;
    const result = calculateBlueCarbon(input);
    const saved = await saveBlueCarbonCalculation({ ...result, lokasi: lokasi ?? null });

    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    console.error("Error calculating blue carbon:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menyimpan kalkulasi" },
      { status: 500 }
    );
  }
}
