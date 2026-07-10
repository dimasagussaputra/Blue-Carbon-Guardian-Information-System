"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const PetaMap = dynamic(() => import("@/components/admin/Peta/PetaMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="size-6 animate-spin text-brand-green-medium" />
    </div>
  ),
});

export default function PetaPage() {
  return <PetaMap />;
}
