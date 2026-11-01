"use client";

import { useSyncExternalStore } from "react";
import { TEMPLATE_BY_ID } from "@/features/floorplan/templates";
import { createEmptyScene } from "@/features/floorplan/scene";
import type { FloorPlanScene } from "@/features/floorplan/types";

export type DesignStatus = "Draft" | "In review" | "Approved" | "Archived";

export interface Collaborator {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: string;
}

export interface DesignRecord {
  id: string;
  name: string;
  eventType: string;
  venueName: string;
  eventDate: string;
  guestCount: number;
  status: DesignStatus;
  starred: boolean;
  createdAt: number;
  updatedAt: number;
  ownerId: string;
  scene: FloorPlanScene;
  collaborators: Collaborator[];
}

const DESIGNS_KEY = "hallcraft.designs.v1";
const SEEDED_KEY = "hallcraft.seeded.v1";

const COLLABORATORS: Collaborator[] = [
  { id: "col_tony", name: "Tony Bello", initials: "TB", color: "#7c5cff", role: "Production" },
  { id: "col_mae", name: "Mae Okafor", initials: "MO", color: "#2f8f5b", role: "Decor" },
  { id: "col_luis", name: "Luis Ferreira", initials: "LF", color: "#d4592f", role: "Venue" },
  { id: "col_sunni", name: "Sunni Patel", initials: "SP", color: "#8b5cab", role: "Catering" },
];

const EMPTY: DesignRecord[] = [];
const listeners = new Set<() => void>();
let designs: DesignRecord[] | null = null;
let ready = false;

function emit() {
  listeners.forEach((listener) => listener());
}

function templateScene(id: string, name: string) {
  const template = TEMPLATE_BY_ID[id];
  if (!template) return createEmptyScene(name);
  const scene = template.build();
  scene.name = name;
  return scene;
}

function seedDesigns(): DesignRecord[] {
  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;
  return [
    {
      id: "dsg_aurora",
      name: "Aurora Awards 2026",
      eventType: "Corporate",
      venueName: "The Foundry",
      eventDate: "2026-11-18",
      guestCount: 160,
      status: "In review",
      starred: true,
      createdAt: now - day * 26,
      updatedAt: now - 1000 * 60 * 34,
      ownerId: "usr_maya",
      scene: templateScene("awards", "Aurora Awards 2026"),
      collaborators: [COLLABORATORS[0], COLLABORATORS[2], COLLABORATORS[3]],
    },
    {
      id: "dsg_okonkwo",
      name: "Okonkwo & Bello",
      eventType: "Wedding",
      venueName: "The Orangery",
      eventDate: "2026-12-06",
      guestCount: 120,
      status: "Approved",
      starred: true,
      createdAt: now - day * 58,
      updatedAt: now - 1000 * 60 * 60 * 5,
      ownerId: "usr_maya",
      scene: templateScene("wedding", "Okonkwo & Bello"),
      collaborators: [COLLABORATORS[1], COLLABORATORS[2]],
    },
    {
      id: "dsg_northline",
      name: "Northline Winter Gala",
      eventType: "Gala dinner",
      venueName: "Grand Hall",
      eventDate: "2026-12-19",
      guestCount: 200,
      status: "Draft",
      starred: false,
      createdAt: now - day * 12,
      updatedAt: now - 1000 * 60 * 60 * 26,
      ownerId: "usr_maya",
      scene: templateScene("gala", "Northline Winter Gala"),
      collaborators: [COLLABORATORS[0], COLLABORATORS[1], COLLABORATORS[3]],
    },
    {
      id: "dsg_halo",
      name: "Halo Hardware Launch",
      eventType: "Product launch",
      venueName: "Dock 9",
      eventDate: "2026-11-27",
      guestCount: 180,
      status: "In review",
      starred: false,
      createdAt: now - day * 8,
      updatedAt: now - 1000 * 60 * 60 * 48,
      ownerId: "usr_maya",
      scene: templateScene("launch", "Halo Hardware Launch"),
      collaborators: [COLLABORATORS[0], COLLABORATORS[3]],
    },
    {
      id: "dsg_meridian",
      name: "Meridian Leadership Summit",
      eventType: "Conference",
      venueName: "Convention Centre",
      eventDate: "2027-02-04",
      guestCount: 280,
      status: "Approved",
      starred: false,
      createdAt: now - day * 42,
      updatedAt: now - day * 3,
      ownerId: "usr_maya",
      scene: templateScene("conference", "Meridian Leadership Summit"),
      collaborators: [COLLABORATORS[1], COLLABORATORS[3]],
    },
  ];
}

function readDesigns(): DesignRecord[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DESIGNS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DesignRecord[];
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(
      (design) =>
        design?.id &&
        design?.scene?.canvas &&
        design?.scene?.elements &&
        design?.name,
    );
  } catch {
    return null;
  }
}

function persist() {
  if (typeof window === "undefined" || !designs) return;
  try {
    window.localStorage.setItem(DESIGNS_KEY, JSON.stringify(designs));
    window.localStorage.setItem(SEEDED_KEY, "true");
  } catch {
    // A full or blocked storage should not break the editor session.
  }
}

function setDesigns(next: DesignRecord[]) {
  designs = next;
  persist();
  emit();
}

export function mountDesigns() {
  if (typeof window === "undefined" || ready) return;
  const stored = readDesigns();
  if (stored) {
    designs = stored;
  } else {
    designs = seedDesigns();
    persist();
  }
  ready = true;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDesigns() {
  return useSyncExternalStore(
    subscribe,
    () => designs ?? EMPTY,
    () => EMPTY,
  );
}

export function useDesignsReady() {
  return useSyncExternalStore(
    subscribe,
    () => ready,
    () => false,
  );
}

export function getDesigns() {
  return designs ?? [];
}

export function getDesign(id: string) {
  return (designs ?? []).find((design) => design.id === id) ?? null;
}

export function saveDesignScene(id: string, scene: FloorPlanScene) {
  if (!designs) return;
  const index = designs.findIndex((design) => design.id === id);
  if (index === -1) return;
  const next = [...designs];
  next[index] = {
    ...next[index],
    name: scene.name || next[index].name,
    scene: { ...scene, updatedAt: Date.now() },
    updatedAt: Date.now(),
    guestCount: scene.guestCount ?? next[index].guestCount,
    eventType: scene.eventType ?? next[index].eventType,
    venueName: scene.venueName ?? next[index].venueName,
  };
  setDesigns(next);
}

export function updateDesign(id: string, patch: Partial<DesignRecord>) {
  if (!designs) return;
  const next = designs.map((design) =>
    design.id === id ? { ...design, ...patch, updatedAt: Date.now() } : design,
  );
  setDesigns(next);
}

export function createDesign(input: {
  name: string;
  eventType: string;
  venueName: string;
  eventDate: string;
  guestCount: number;
  scene?: FloorPlanScene;
  status?: DesignStatus;
}): DesignRecord {
  const now = Date.now();
  const id = `dsg_${Math.random().toString(36).slice(2, 9)}`;
  const scene = input.scene
    ? {
        ...input.scene,
        name: input.name,
        venueName: input.venueName,
        eventType: input.eventType,
        guestCount: input.guestCount,
      }
    : createEmptyScene(input.name, 22, 28);
  const design: DesignRecord = {
    id,
    name: input.name,
    eventType: input.eventType,
    venueName: input.venueName,
    eventDate: input.eventDate,
    guestCount: input.guestCount,
    status: input.status ?? "Draft",
    starred: false,
    createdAt: now,
    updatedAt: now,
    ownerId: "usr_maya",
    scene,
    collaborators: [COLLABORATORS[0]],
  };
  setDesigns([design, ...(designs ?? [])]);
  return design;
}

export function deleteDesign(id: string) {
  if (!designs) return;
  setDesigns(designs.filter((design) => design.id !== id));
}

export function duplicateDesign(id: string): DesignRecord | null {
  const source = getDesign(id);
  if (!designs || !source) return null;
  const copy: DesignRecord = {
    ...source,
    id: `dsg_${Math.random().toString(36).slice(2, 9)}`,
    name: `${source.name} copy`,
    status: "Draft",
    starred: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    scene: JSON.parse(JSON.stringify(source.scene)) as FloorPlanScene,
  };
  setDesigns([copy, ...designs]);
  return copy;
}

export function toggleStar(id: string) {
  if (!designs) return;
  setDesigns(
    designs.map((design) =>
      design.id === id ? { ...design, starred: !design.starred } : design,
    ),
  );
}

export const TEAM_COLLABORATORS = COLLABORATORS;
