import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const MAX_SIZE = 20 * 1024 * 1024;
const VALID_KATEGORI = ["proposal", "laporan", "sop", "dokumentasi"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const kategori = formData.get("kategori") as string | null;
    const judul = (formData.get("judul") as string) || "";
    const deskripsi = (formData.get("deskripsi") as string) || "";

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
        { error: "Tipe file harus PDF, DOCX, atau XLSX" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 20MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = file.name.replace(/\s+/g, "_");
    const timestamp = Date.now();
    const filePath = `${kategori}/${timestamp}-${safeName}`;

    const supabase = await createClient();

    const { error: uploadError } = await supabase.storage
      .from("dokumen")
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
      .from("dokumen")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    const { data: record, error: insertError } = await supabase
      .from("dokumen")
      .insert({
        kategori,
        judul,
        deskripsi,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        public_url: publicUrl,
      })
      .select()
      .single();

    if (insertError) {
      await supabase.storage.from("dokumen").remove([filePath]);
      return NextResponse.json(
        { error: "Gagal menyimpan data dokumen" },
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
