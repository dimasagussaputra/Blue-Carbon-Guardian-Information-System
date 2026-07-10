import { NextRequest, NextResponse } from "next/server";
import { getActivityLogs } from "@/lib/activity-log/service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const offset = (page - 1) * limit;

    const result = await getActivityLogs(limit, offset);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Gagal memuat activity log", data: [], total: 0 },
      { status: 500 }
    );
  }
}
