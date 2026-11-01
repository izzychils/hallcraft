"use client";

import { useEffect } from "react";
import { mountAuth } from "@/features/auth/auth";
import { mountDesigns } from "@/features/designs/library";
import { mountTeam } from "@/features/team/team";
import { Toaster } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    mountAuth();
    mountDesigns();
    mountTeam();
  }, []);

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
