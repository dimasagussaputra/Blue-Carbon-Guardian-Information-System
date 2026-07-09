import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/roles";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

const TABLE_LABELS: Record<string, string> = {
  area_monitoring: "Area Monitoring",
  spesies: "Spesies",
  tegakan: "Tegakan",
  monitoring: "Monitoring",
  penyulaman: "Penyulaman",
  kualitas_air: "Kualitas Air",
  blue_carbon_calculations: "Blue Carbon",
  galeri: "Galeri",
  dokumen: "Dokumen",
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

interface BackupPayload {
  metadata: {
    version: string;
    exportedAt: string;
    exportedBy: string;
    tableCount: number;
    totalRows: number;
  };
  data: Record<string, unknown[]>;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user || !isAdmin(userData.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json") && !contentType.includes("text/plain")) {
      return NextResponse.json({ error: "Format tidak didukung, gunakan JSON" }, { status: 400 });
    }

    const text = await request.text();
    if (text.length > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File terlalu besar (maks 100MB)" }, { status: 413 });
    }

    let payload: BackupPayload;
    try {
      payload = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Format JSON tidak valid" }, { status: 400 });
    }

    if (!payload.metadata || !payload.data) {
      return NextResponse.json({ error: "Struktur backup tidak valid" }, { status: 400 });
    }

    const restored: Record<string, number> = {};
    const errors: string[] = [];

    const insertOrder: (typeof BACKUP_TABLES[number])[] = [
      "area_monitoring",
      "spesies",
      "tegakan",
      "monitoring",
      "penyulaman",
      "kualitas_air",
      "blue_carbon_calculations",
      "galeri",
      "dokumen",
    ];

    const deleteOrder = [...insertOrder].reverse();

    // ── Clear existing data (reverse FK order) ──
    for (const table of deleteOrder) {
      try {
        await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
      } catch {
        // table may not exist or have different PK — skip gracefully
      }
    }

    // ── Insert data (FK order) ──
    for (const table of insertOrder) {
      const rows = payload.data[table];
      if (!rows || !Array.isArray(rows) || rows.length === 0) {
        restored[table] = 0;
        continue;
      }

      const label = TABLE_LABELS[table] ?? table;
      const BATCH_SIZE = 50;
      let inserted = 0;

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from(table).upsert(batch, {
          onConflict: "id",
          ignoreDuplicates: false,
        });

        if (error) {
          errors.push(`${label} (batch ${Math.floor(i / BATCH_SIZE) + 1}): ${error.message}`);
        } else {
          inserted += batch.length;
        }
      }

      restored[table] = inserted;
    }

    const totalRestored = Object.values(restored).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      success: true,
      restored,
      totalRows: totalRestored,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("Backup import error:", err);
    return NextResponse.json({ error: "Gagal merestore data" }, { status: 500 });
  }
}
