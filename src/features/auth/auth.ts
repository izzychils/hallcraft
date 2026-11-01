"use client";

import { useSyncExternalStore } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  studio: string;
  role: string;
  createdAt: number;
}

interface StoredUser extends User {
  password: string;
}

interface AuthSnapshot {
  user: User | null;
  ready: boolean;
}

const USERS_KEY = "hallcraft.users.v1";
const SESSION_KEY = "hallcraft.session.v1";

const DEMO_USER: StoredUser = {
  id: "usr_maya",
  name: "Maya Adeyemi",
  email: "maya@northlight.studio",
  studio: "Northlight Events",
  role: "Lead planner",
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 120,
  password: hash("hallcraft"),
};

const SERVER_SNAPSHOT: AuthSnapshot = { user: null, ready: false };
let snapshot: AuthSnapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function hash(value: string) {
  // A demo-only digest. Credentials never leave this browser, and this is not
  // intended as production authentication.
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result << 5) - result + value.charCodeAt(index);
    result |= 0;
  }
  return `h${Math.abs(result).toString(36)}`;
}

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [DEMO_USER];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    const parsed = raw ? (JSON.parse(raw) as StoredUser[]) : [];
    if (!Array.isArray(parsed)) return [DEMO_USER];
    if (!parsed.some((user) => user.id === DEMO_USER.id)) parsed.push(DEMO_USER);
    return parsed;
  } catch {
    return [DEMO_USER];
  }
}

function writeUsers(users: StoredUser[]) {
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // Storage can be unavailable; this tab still works for the session.
  }
}

function publicUser(user: StoredUser): User {
  const { password: _password, ...rest } = user;
  return rest;
}

function readSession(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as { userId?: string };
    if (!session?.userId) return null;
    const user = readUsers().find((item) => item.id === session.userId);
    return user ? publicUser(user) : null;
  } catch {
    return null;
  }
}

export function mountAuth() {
  if (typeof window === "undefined") return;
  const user = readSession();
  const next = { user, ready: true };
  if (snapshot.user?.id !== next.user?.id || !snapshot.ready) {
    snapshot = next;
    emit();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAuth() {
  return useSyncExternalStore(subscribe, () => snapshot, () => SERVER_SNAPSHOT);
}

export function signIn(email: string, password: string): { user?: User; error?: string } {
  const users = readUsers();
  const user = users.find(
    (item) => item.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!user) return { error: "No studio account found with that email." };
  if (user.password !== hash(password)) return { error: "That password does not match." };
  const nextUser = publicUser(user);
  try {
    window.localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ userId: user.id, signedInAt: Date.now() }),
    );
  } catch {
    // ignore storage failures
  }
  snapshot = { user: nextUser, ready: true };
  emit();
  return { user: nextUser };
}

export function signUp(input: {
  name: string;
  email: string;
  password: string;
  studio: string;
}): { user?: User; error?: string } {
  const users = readUsers();
  if (
    users.some((user) => user.email.toLowerCase() === input.email.trim().toLowerCase())
  ) {
    return { error: "An account already exists with that email." };
  }
  if (input.password.length < 6) {
    return { error: "Use at least 6 characters for the password." };
  }
  const user: StoredUser = {
    id: `usr_${Math.random().toString(36).slice(2, 9)}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    studio: input.studio.trim() || "Independent studio",
    role: "Event designer",
    createdAt: Date.now(),
    password: hash(input.password),
  };
  users.push(user);
  writeUsers(users);
  try {
    window.localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ userId: user.id, signedInAt: Date.now() }),
    );
  } catch {
    // ignore
  }
  const nextUser = publicUser(user);
  snapshot = { user: nextUser, ready: true };
  emit();
  return { user: nextUser };
}

export function signInDemo() {
  return signIn(DEMO_USER.email, "hallcraft");
}

export function signOut() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
  snapshot = { user: null, ready: true };
  emit();
}

export function updateProfile(patch: Partial<Pick<User, "name" | "studio" | "role">>) {
  if (!snapshot.user) return;
  const users = readUsers();
  const index = users.findIndex((user) => user.id === snapshot.user?.id);
  if (index === -1) return;
  users[index] = { ...users[index], ...patch };
  writeUsers(users);
  snapshot = { user: publicUser(users[index]), ready: true };
  emit();
}

export const DEMO_CREDENTIALS = {
  email: DEMO_USER.email,
  password: "hallcraft",
};
