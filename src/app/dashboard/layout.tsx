import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { NewDesignProvider } from "@/features/designs/new-design";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <NewDesignProvider>
      <WorkspaceShell>{children}</WorkspaceShell>
    </NewDesignProvider>
  );
}
