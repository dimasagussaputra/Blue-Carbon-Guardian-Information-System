import { createClient } from "@/lib/supabase/server";

export interface SpesiesItem {
  id: string;
  nama: string;
}

export async function getSpesiesList(): Promise<SpesiesItem[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("spesies")
      .select("id, nama")
      .order("nama", { ascending: true });

    return data ?? [];
  } catch {
    return [];
  }
}
