"use client";

import { useSyncExternalStore } from "react";

export type TeamRole = "Owner" | "Planner" | "Production" | "Vendor" | "Viewer";
export type TeamStatus = "Active" | "Invited";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: TeamStatus;
  color: string;
  projects: number;
  joinedAt: number;
}

const KEY = "hallcraft.team.v1";
const EMPTY: TeamMember[] = [];

const SEED: TeamMember[] = [
  {
    id: "team_maya",
    name: "Maya Adeyemi",
    email: "maya@northlight.studio",
    role: "Owner",
    status: "Active",
    color: "#7c5cff",
    projects: 5,
    joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 120,
  },
  {
    id: "team_tony",
    name: "Tony Bello",
    email: "tony@northlight.studio",
    role: "Production",
    status: "Active",
    color: "#d4592f",
    projects: 3,
    joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 88,
  },
  {
    id: "team_mae",
    name: "Mae Okafor",
    email: "mae@studiobloom.co",
    role: "Vendor",
    status: "Active",
    color: "#2f8f5b",
    projects: 2,
    joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 61,
  },
  {
    id: "team_luis",
    name: "Luis Ferreira",
    email: "luis@thefoundry.venue",
    role: "Vendor",
    status: "Active",
    color: "#3c6f9e",
    projects: 2,
    joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 34,
  },
  {
    id: "team_sunni",
    name: "Sunni Patel",
    email: "sunni@tableandthyme.com",
    role: "Planner",
    status: "Invited",
    color: "#8b5cab",
    projects: 1,
    joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
];

let members: TeamMember[] | null = null;
let ready = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function read(): TeamMember[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TeamMember[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function persist() {
  if (typeof window === "undefined" || !members) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(members));
  } catch {
    // ignore
  }
}

function setMembers(next: TeamMember[]) {
  members = next;
  persist();
  emit();
}

export function mountTeam() {
  if (typeof window === "undefined" || ready) return;
  members = read() ?? SEED;
  persist();
  ready = true;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTeam() {
  return useSyncExternalStore(
    subscribe,
    () => members ?? EMPTY,
    () => EMPTY,
  );
}

export function inviteMember(input: { name: string; email: string; role: TeamRole }) {
  const palette = ["#7c5cff", "#d4592f", "#2f8f5b", "#3c6f9e", "#8b5cab"];
  const member: TeamMember = {
    id: `team_${Math.random().toString(36).slice(2, 8)}`,
    name: input.name.trim() || input.email.split("@")[0],
    email: input.email.trim().toLowerCase(),
    role: input.role,
    status: "Invited",
    color: palette[Math.floor(Math.random() * palette.length)],
    projects: 0,
    joinedAt: Date.now(),
  };
  setMembers([...(members ?? []), member]);
  return member;
}

export function updateMember(id: string, patch: Partial<Pick<TeamMember, "role" | "status">>) {
  setMembers((members ?? []).map((member) => (member.id === id ? { ...member, ...patch } : member)));
}

export function removeMember(id: string) {
  setMembers((members ?? []).filter((member) => member.id !== id));
}
