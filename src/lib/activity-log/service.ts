import { createClient } from "@/lib/supabase/server";

export type ActivityAction = "create" | "update" | "delete" | "restore" | "force_delete" | "login" | "logout" | "export" | "upload";
export type ActivityEntity = "tegakan" | "monitoring" | "penyulaman" | "kualitas_air" | "blue_carbon" | "galeri" | "dokumen" | "user" | "laporan";

export interface ActivityLogEntry {
  id: string;
  user_id: string | null;
  action: ActivityAction;
  entity_type: ActivityEntity;
  entity_id?: string;
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export async function logActivity(
  action: ActivityAction,
  entityType: ActivityEntity,
  description: string,
  options?: {
    entityId?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("activity_log").insert({
      user_id: user?.id ?? null,
      action,
      entity_type: entityType,
      entity_id: options?.entityId ?? null,
      description,
      metadata: options?.metadata ?? null,
    });
  } catch {
    // Silently fail - activity logging should never break the main flow
  }
}

export async function getActivityLogs(
  limit = 50,
  offset = 0
): Promise<{ data: ActivityLogEntry[]; total: number }> {
  const supabase = await createClient();

  const { data, count, error } = await supabase
    .from("activity_log")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);
  return { data: (data as ActivityLogEntry[]) ?? [], total: count ?? 0 };
}
