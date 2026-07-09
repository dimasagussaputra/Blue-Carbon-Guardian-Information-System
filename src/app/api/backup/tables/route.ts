import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/roles";

const BACKUP_TABLES = [
  "area_monitoring",
  "spesies",
  "tegakan",
  "monitoring",
  "penyulaman",
  "kualitas_air",
  "blue_carbon_calculations",
  "galeri",
  "dokumen",
] as const;

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user || !isAdmin(userData.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const counts: Record<string, number> = {};
    for (const table of BACKUP_TABLES) {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });
      counts[table] = error ? -1 : (count ?? 0);
    }

    return NextResponse.json({ tables: BACKUP_TABLES, counts });
  } catch (err) {
    console.error("Backup tables error:", err);
    return NextResponse.json({ error: "Gagal membaca informasi tabel" }, { status: 500 });
  }
}
