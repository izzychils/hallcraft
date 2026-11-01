"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Link2,
  Mail,
  MoreHorizontal,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Menu, MenuItem, MenuLabel, MenuSeparator } from "@/components/ui/menu";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { Avatar, Badge } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import {
  inviteMember,
  mountTeam,
  removeMember,
  updateMember,
  useTeam,
  type TeamRole,
} from "@/features/team/team";
import { copyText } from "@/lib/utils";

const ROLES: TeamRole[] = ["Owner", "Planner", "Production", "Vendor", "Viewer"];

const ROLE_COPY: Record<TeamRole, string> = {
  Owner: "Billing, access and every design",
  Planner: "Create and edit designs, invite vendors",
  Production: "Edit plans, manage tasks and exports",
  Vendor: "View shared plans and assigned zones",
  Viewer: "Read-only access to shared plans",
};

export default function TeamPage() {
  const team = useTeam();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("Planner");
  const [removing, setRemoving] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    mountTeam();
  }, []);

  const active = useMemo(() => team.filter((member) => member.status === "Active"), [team]);
  const invited = useMemo(() => team.filter((member) => member.status === "Invited"), [team]);

  const sendInvite = () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Add a valid email", "The invite link needs somewhere to land.");
      return;
    }
    const member = inviteMember({ name, email, role });
    setInviteOpen(false);
    setName("");
    setEmail("");
    setRole("Planner");
    toast.success("Invite created", `${member.email} is marked as invited on this device.`);
  };

  const inviteLink = "https://hallcraft.studio/join/northlight";

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 pb-16 pt-8 lg:px-9 lg:pt-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Team & access</p>
          <h1 className="mt-3 text-[clamp(2rem,4vw,3.2rem)] font-medium leading-[0.96] tracking-[-0.055em]">
            Everyone reads
            <br />
            the same room.
          </h1>
          <p className="mt-3 max-w-lg text-[13.5px] leading-6 text-[#6f695e]">
            Planners, production, venue teams and vendors. Give people the access they need, not
            the whole studio.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              void copyText(inviteLink);
              setCopied(true);
              toast.success("Invite link copied", "This demo link is local to your studio.");
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy invite link"}
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-3.5 w-3.5" />
            Invite someone
          </Button>
        </div>
      </header>

      <div className="mt-7 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-[#ddd6c8] bg-[#fbf8f1]">
          <div className="flex items-center justify-between border-b border-[#e7e0d2] px-4 py-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#726b5f]" />
              <h2 className="text-[13px] font-semibold">Studio members</h2>
              <Badge tone="neutral">{active.length} active</Badge>
            </div>
            <span className="text-[10.5px] text-[#9a9488]">Stored locally for this preview</span>
          </div>

          <ul className="divide-y divide-[#ece6d9]">
            {team.length === 0 ? (
              <li className="px-4 py-10 text-center text-[12px] text-[#8a8376]">
                No one else in the studio yet.
              </li>
            ) : (
              team.map((member) => (
                <li key={member.id} className="flex items-center gap-3 px-4 py-3">
                  <Avatar name={member.name} color={member.color} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[12.5px] font-medium">{member.name}</p>
                      {member.status === "Invited" ? (
                        <Badge tone="warning">Invited</Badge>
                      ) : member.role === "Owner" ? (
                        <Badge tone="lime">Owner</Badge>
                      ) : null}
                    </div>
                    <p className="truncate text-[11px] text-[#8a8376]">{member.email}</p>
                  </div>
                  <span className="hidden w-24 text-right text-[10.5px] text-[#8a8376] sm:block">
                    {member.projects} design{member.projects === 1 ? "" : "s"}
                  </span>
                  <span className="hidden w-24 rounded-full bg-[#f0ebdf] px-2 py-1 text-center text-[10px] font-medium text-[#5d574c] sm:block">
                    {member.role}
                  </span>
                  <Menu
                    width={210}
                    trigger={
                      <button
                        type="button"
                        className="grid h-7 w-7 place-items-center rounded-md text-[#8a8376] transition-colors hover:bg-[#eee9dd] hover:text-[#171510]"
                        aria-label={`${member.name} access options`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    }
                  >
                    <MenuLabel>Change role</MenuLabel>
                    {ROLES.map((nextRole) => (
                      <MenuItem
                        key={nextRole}
                        disabled={member.role === nextRole}
                        onClick={() => {
                          updateMember(member.id, { role: nextRole });
                          toast.success("Role updated", `${member.name} is now ${nextRole.toLowerCase()}.`);
                        }}
                      >
                        {nextRole}
                      </MenuItem>
                    ))}
                    {member.status === "Invited" ? (
                      <>
                        <MenuSeparator />
                        <MenuItem
                          onClick={() => {
                            updateMember(member.id, { status: "Active" });
                            toast.success("Invite accepted", `${member.name} joined the studio.`);
                          }}
                        >
                          Mark as joined
                        </MenuItem>
                      </>
                    ) : null}
                    <MenuSeparator />
                    <MenuItem destructive onClick={() => setRemoving(member.id)}>
                      <span className="flex items-center gap-2">
                        <Trash2 className="h-3.5 w-3.5" /> Remove from studio
                      </span>
                    </MenuItem>
                  </Menu>
                </li>
              ))
            )}
          </ul>

          {invited.length > 0 ? (
            <div className="border-t border-[#e7e0d2] bg-[#f8f4ea] px-4 py-3">
              <p className="text-[10.5px] text-[#8a8376]">
                {invited.length} pending invite{invited.length === 1 ? "" : "s"} · invites are
                simulated in this frontend build.
              </p>
            </div>
          ) : null}
        </section>

        <aside className="space-y-3">
          <div className="rounded-2xl border border-[#ddd6c8] bg-[#f8f4ea] p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e4f0bd]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#4a5a1d]" />
              </span>
              <h2 className="text-[12.5px] font-semibold">Access, in plain words</h2>
            </div>
            <ul className="mt-3 space-y-2.5">
              {ROLES.map((item) => (
                <li key={item}>
                  <p className="text-[11px] font-medium text-[#3c3830]">{item}</p>
                  <p className="text-[10.5px] leading-4 text-[#8a8376]">{ROLE_COPY[item]}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-[#0d4a45] p-4 text-[#eaf7df]">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#9fd3b8]">Site visits</p>
            <p className="mt-2 text-[15px] font-medium leading-5 tracking-[-0.02em]">
              Vendors can open the plan on their phone without a paid seat.
            </p>
            <p className="mt-2 text-[10.5px] leading-5 text-[#a9d6c0]">
              Share a read-only preview link from any design. Measurements stay locked to the
              latest saved version.
            </p>
          </div>
        </aside>
      </div>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite someone to the studio"
        description="They'll see shared designs only. You can change access at any time."
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" className="gap-1.5" onClick={sendInvite}>
              <Mail className="h-3.5 w-3.5" />
              Create invite
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-name">Name</Label>
            <Input
              id="invite-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ifeoma Nwosu"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Work email</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ifeoma@venue.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-role">Access level</Label>
            <Select
              id="invite-role"
              value={role}
              onChange={(event) => setRole(event.target.value as TeamRole)}
            >
              {ROLES.map((item) => (
                <option key={item} value={item}>
                  {item}: {ROLE_COPY[item]}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title="Remove this person?"
        description="They lose access to every shared design in this studio. You can invite them again later."
        confirmLabel="Remove access"
        destructive
        onConfirm={() => {
          if (removing) {
            removeMember(removing);
            toast.success("Access removed");
          }
          setRemoving(null);
        }}
      />
    </div>
  );
}
