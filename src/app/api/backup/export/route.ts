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

    const data: Record<string, unknown[]> = {};
    let totalRows = 0;

    for (const table of BACKUP_TABLES) {
      const { data: rows, error } = await supabase.from(table).select("*");
      if (error) {
        console.error(`Error fetching ${table}:`, error);
        data[table] = [];
      } else {
        data[table] = rows ?? [];
        totalRows += data[table].length;
      }
    }

    const exportData = {
      metadata: {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        exportedBy: userData.user.email ?? "unknown",
        tableCount: BACKUP_TABLES.length,
        totalRows,
      },
      data,
    };

    const jsonStr = JSON.stringify(exportData, null, 2);
    const buffer = Buffer.from(jsonStr, "utf-8");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="BCG-Backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (err) {
    console.error("Backup export error:", err);
    return NextResponse.json({ error: "Gagal mengexport backup" }, { status: 500 });
  }
}
