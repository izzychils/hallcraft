"use client";

import { useEffect, useState } from "react";
import { Database, Download, RotateCcw, Save, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/modal";
import { Badge } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { updateProfile, useAuth } from "@/features/auth/auth";
import { useDesigns } from "@/features/designs/library";
import { useTeam } from "@/features/team/team";
import { downloadFile } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useAuth();
  const designs = useDesigns();
  const team = useTeam();
  const [name, setName] = useState("");
  const [studio, setStudio] = useState("");
  const [role, setRole] = useState("");
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setStudio(user.studio);
    setRole(user.role);
  }, [user]);

  const save = () => {
    if (!name.trim()) {
      toast.error("A name is required", "Add your name before saving.");
      return;
    }
    updateProfile({ name: name.trim(), studio: studio.trim(), role: role.trim() });
    toast.success("Profile saved", "Your studio details are up to date.");
  };

  const exportWorkspace = () => {
    downloadFile(
      `hallcraft-workspace-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify({ exportedAt: new Date().toISOString(), designs, team }, null, 2),
      "application/json",
    );
    toast.success("Workspace exported", "Designs and team access were downloaded as JSON.");
  };

  return (
    <div className="mx-auto w-full max-w-[980px] px-5 pb-16 pt-8 lg:px-9 lg:pt-10">
      <header>
        <p className="eyebrow">Settings</p>
        <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-medium leading-[0.96] tracking-[-0.055em]">
          Your studio,
          <br />
          your call.
        </h1>
        <p className="mt-3 max-w-lg text-[13.5px] leading-6 text-[#6f695e]">
          Profile and local workspace settings. In this frontend build, everything is kept in this
          browser.
        </p>
      </header>

      <section className="mt-7 overflow-hidden rounded-2xl border border-[#ddd6c8] bg-[#fbf8f1]">
        <div className="flex items-center gap-2 border-b border-[#e7e0d2] px-4 py-3">
          <UserRound className="h-4 w-4 text-[#726b5f]" />
          <h2 className="text-[13px] font-semibold">Profile</h2>
          <Badge tone="neutral" className="ml-auto">
            {user?.email}
          </Badge>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="settings-name">Name</Label>
            <Input
              id="settings-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={60}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-studio">Studio name</Label>
            <Input
              id="settings-studio"
              value={studio}
              onChange={(event) => setStudio(event.target.value)}
              maxLength={60}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-role">Your role</Label>
            <Input
              id="settings-role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              maxLength={40}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled className="bg-[#f1ece0]" />
          </div>
        </div>
        <div className="flex justify-end border-t border-[#e7e0d2] bg-[#f8f4ea] px-4 py-3">
          <Button size="sm" className="gap-1.5" onClick={save}>
            <Save className="h-3.5 w-3.5" />
            Save profile
          </Button>
        </div>
      </section>

      <section className="mt-3 overflow-hidden rounded-2xl border border-[#ddd6c8] bg-[#fbf8f1]">
        <div className="flex items-center gap-2 border-b border-[#e7e0d2] px-4 py-3">
          <Database className="h-4 w-4 text-[#726b5f]" />
          <h2 className="text-[13px] font-semibold">Workspace data</h2>
        </div>
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[12px] font-medium">
              {designs.length} designs · {team.length} people
            </p>
            <p className="mt-1 max-w-md text-[11px] leading-5 text-[#8a8376]">
              Plans, guest counts, custom items and access are stored in localStorage. Export a
              copy before clearing your browser data.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={exportWorkspace}>
              <Download className="h-3.5 w-3.5" />
              Export workspace
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-[#9b3d2a]"
              onClick={() => setResetOpen(true)}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset demo data
            </Button>
          </div>
        </div>
      </section>

      <p className="mt-5 text-center text-[10.5px] text-[#a09889]">
        Hallcraft frontend preview · No data leaves this device.
      </p>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset the demo workspace?"
        description="Every design, invite and custom item in this browser is removed and the starter studio is restored. Export first if you want to keep anything."
        confirmLabel="Reset workspace"
        destructive
        onConfirm={() => {
          try {
            window.localStorage.removeItem("hallcraft.designs.v1");
            window.localStorage.removeItem("hallcraft.team.v1");
            window.localStorage.removeItem("hallcraft.seeded.v1");
          } catch {
            // ignore
          }
          window.location.reload();
        }}
      />
    </div>
  );
}
