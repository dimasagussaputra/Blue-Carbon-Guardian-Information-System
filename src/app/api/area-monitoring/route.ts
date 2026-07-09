import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("area_monitoring")
      .select("id, nama")
      .order("nama", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Gagal mengambil data area monitoring" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data area monitoring" },
      { status: 500 }
    );
  }
}
