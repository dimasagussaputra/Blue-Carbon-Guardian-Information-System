import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;
const VALID_KATEGORI = [
  "before",
  "after",
  "monitoring",
  "penyulaman",
  "edukasi",
  "clean_up",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const kategori = formData.get("kategori") as string | null;
    const judul = (formData.get("judul") as string) || "";
    const deskripsi = (formData.get("deskripsi") as string) || "";
    const tanggal = (formData.get("tanggal") as string) || "";

    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    if (!kategori || !VALID_KATEGORI.includes(kategori)) {
      return NextResponse.json(
        { error: "Kategori tidak valid" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipe file harus JPEG, PNG, atau WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = file.name.replace(/\s+/g, "_");
    const filePath = `${kategori}/${Date.now()}-${safeName}`;

    const supabase = await createClient();

    const { error: uploadError } = await supabase.storage
      .from("galeri")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "Gagal mengupload file ke penyimpanan" },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("galeri")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    const { data: record, error: insertError } = await supabase
      .from("galeri")
      .insert({
        kategori,
        judul,
        deskripsi,
        tanggal: tanggal || null,
        file_path: filePath,
        public_url: publicUrl,
      })
      .select()
      .single();

    if (insertError) {
      await supabase.storage.from("galeri").remove([filePath]);
      return NextResponse.json(
        { error: "Gagal menyimpan data galeri" },
        { status: 500 }
      );
    }

    return NextResponse.json(record, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengupload file" },
      { status: 500 }
    );
  }
}
