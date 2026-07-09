"use client";

import { AuthProvider } from "@/contexts/AuthProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
        />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
