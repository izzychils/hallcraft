import { create } from "zustand";
import { CANVAS_LIMITS } from "./constants";
import {
  clamp,
  clampElementSize,
  clampElementToCanvas,
  normalizeRotation,
  roundMetres,
  snapPosition,
} from "./geometry";
import { arrangeTables } from "./generator";
import {
  cloneScene,
  createElementFromDefinition,
  createEmptyScene,
  createSceneId,
  nextZIndex,
  resolveDefinition,
} from "./scene";
import type {
  FloorPlanDefinition,
  FloorPlanElement,
  FloorPlanScene,
  FloorPlanShape,
} from "./types";

export type FloorPlanTool = "select" | "pan";

export interface LiveTransform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

type ElementPatch = Partial<Omit<FloorPlanElement, "style" | "label" | "props">> & {
  style?: Partial<FloorPlanElement["style"]>;
  label?: Partial<FloorPlanElement["label"]>;
  props?: Partial<FloorPlanElement["props"]>;
};

interface FloorPlanState {
  scene: FloorPlanScene;
  selectedIds: string[];
  past: FloorPlanScene[];
  future: FloorPlanScene[];
  tool: FloorPlanTool;
  snapEnabled: boolean;
  dirty: boolean;
  savedAt: number | null;
  liveTransform: LiveTransform | null;

  loadScene: (scene: FloorPlanScene) => void;
  applyScene: (scene: FloorPlanScene) => void;
  replaceScene: (scene: FloorPlanScene) => void;
  updateSceneMeta: (patch: Partial<Pick<FloorPlanScene, "name" | "venueName" | "eventType" | "guestCount">>) => void;
  select: (id: string | null) => void;
  toggleSelect: (id: string) => void;
  selectMany: (ids: string[]) => void;
  clearSelection: () => void;
  setTool: (tool: FloorPlanTool) => void;
  setSnapEnabled: (enabled: boolean) => void;
  setLiveTransform: (value: LiveTransform | null) => void;
  addDefinition: (definition: FloorPlanDefinition) => void;
  addElement: (
    definitionId: string,
    position?: { x: number; y: number },
    snapshot?: FloorPlanDefinition,
  ) => string | null;
  updateElement: (id: string, patch: ElementPatch) => void;
  setElementShape: (id: string, shape: FloorPlanShape) => void;
  moveElements: (positions: Array<{ id: string; x: number; y: number }>) => void;
  removeSelection: () => void;
  duplicateSelection: () => void;
  copySelection: () => void;
  pasteClipboard: () => void;
  toggleLock: (id: string) => void;
  nudgeSelection: (dx: number, dy: number) => void;
  reorderSelection: (direction: "forward" | "backward") => void;
  setCanvasSettings: (
    patch: Partial<Omit<FloorPlanScene["canvas"], "background">> & {
      background?: Partial<FloorPlanScene["canvas"]["background"]>;
    },
  ) => void;
  autoArrange: () => void;
  markSaved: () => void;
  undo: () => void;
  redo: () => void;
}

const HISTORY_LIMIT = 120;
let clipboard: FloorPlanElement[] = [];

function applyPatch(
  element: FloorPlanElement,
  patch: ElementPatch,
  scene: FloorPlanScene,
): FloorPlanElement {
  let updated: FloorPlanElement = {
    ...element,
    ...patch,
    style: { ...element.style, ...patch.style },
    label: { ...element.label, ...patch.label },
    props: { ...element.props, ...patch.props },
  };
  const definition = resolveDefinition(scene.definitions, updated.definitionId);
  if (patch.width !== undefined && patch.height === undefined && definition?.traits.lockAspect) {
    updated.height = patch.width;
  }
  if (patch.height !== undefined && patch.width === undefined && definition?.traits.lockAspect) {
    updated.width = patch.height;
  }
  updated = clampElementSize(updated);
  updated.rotation = normalizeRotation(updated.rotation);
  updated.x = roundMetres(updated.x);
  updated.y = roundMetres(updated.y);
  return updated;
}

export const useFloorPlanStore = create<FloorPlanState>((set, get) => {
  const commit = (next: FloorPlanScene) => {
    const state = get();
    set({
      scene: next,
      past: [...state.past, state.scene].slice(-HISTORY_LIMIT),
      future: [],
      dirty: true,
      liveTransform: null,
    });
  };

  return {
    scene: createEmptyScene(),
    selectedIds: [],
    past: [],
    future: [],
    tool: "select",
    snapEnabled: true,
    dirty: false,
    savedAt: null,
    liveTransform: null,

    loadScene: (scene) =>
      set({
        scene: cloneScene(scene),
        selectedIds: [],
        past: [],
        future: [],
        tool: "select",
        dirty: false,
        savedAt: null,
        liveTransform: null,
      }),

    applyScene: (scene) => {
      const state = get();
      set({
        scene: cloneScene(scene),
        past: [...state.past, state.scene].slice(-HISTORY_LIMIT),
        future: [],
        selectedIds: [],
        dirty: true,
        liveTransform: null,
      });
    },

    replaceScene: (scene) =>
      set({
        scene: cloneScene(scene),
        selectedIds: [],
        past: [],
        future: [],
        dirty: true,
        liveTransform: null,
      }),

    updateSceneMeta: (patch) => {
      const state = get();
      set({ scene: { ...state.scene, ...patch }, dirty: true });
    },

    select: (id) => set({ selectedIds: id ? [id] : [] }),

    toggleSelect: (id) => {
      const selected = get().selectedIds;
      set({
        selectedIds: selected.includes(id)
          ? selected.filter((existing) => existing !== id)
          : [...selected, id],
      });
    },

    selectMany: (ids) => set({ selectedIds: ids }),
    clearSelection: () => set({ selectedIds: [] }),
    setTool: (tool) => set({ tool }),
    setSnapEnabled: (snapEnabled) => set({ snapEnabled }),
    setLiveTransform: (liveTransform) => set({ liveTransform }),

    addDefinition: (definition) => {
      const state = get();
      commit({
        ...state.scene,
        definitions: { ...state.scene.definitions, [definition.id]: definition },
      });
    },

    addElement: (definitionId, position, snapshot) => {
      const state = get();
      if (Object.keys(state.scene.elements).length >= CANVAS_LIMITS.maxElements) return null;
      const definitions = snapshot
        ? { ...state.scene.definitions, [snapshot.id]: snapshot }
        : state.scene.definitions;
      const definition = resolveDefinition(definitions, definitionId);
      if (!definition) return null;

      const offset = Object.keys(state.scene.elements).length % 5;
      const raw = position ?? {
        x: state.scene.canvas.width / 2 + offset * 0.3,
        y: state.scene.canvas.height / 2 + offset * 0.3,
      };
      const snapped = snapPosition(
        raw.x,
        raw.y,
        { width: definition.defaultWidth, height: definition.defaultHeight, rotation: 0 },
        state.scene,
        state.snapEnabled,
      );
      const element = clampElementToCanvas(
        createElementFromDefinition(
          definition,
          snapped.x,
          snapped.y,
          nextZIndex(state.scene),
        ),
        state.scene.canvas,
      );
      set({
        scene: {
          ...state.scene,
          definitions,
          elements: { ...state.scene.elements, [element.id]: element },
        },
        selectedIds: [element.id],
        past: [...state.past, state.scene].slice(-HISTORY_LIMIT),
        future: [],
        dirty: true,
      });
      return element.id;
    },

    updateElement: (id, patch) => {
      const state = get();
      const element = state.scene.elements[id];
      if (!element || element.locked) return;
      const updated = clampElementToCanvas(
        applyPatch(element, patch, state.scene),
        state.scene.canvas,
      );
      commit({
        ...state.scene,
        elements: { ...state.scene.elements, [id]: updated },
      });
    },

    setElementShape: (id, shape) => {
      const state = get();
      const element = state.scene.elements[id];
      if (!element || element.locked) return;
      const definition = resolveDefinition(state.scene.definitions, element.definitionId);
      if (definition?.traits.seats?.layout === "ring" && shape !== "circle") {
        // A ringside table only reads correctly as a circle in this studio.
        return;
      }
      let width = element.width;
      let height = element.height;
      if (shape === "circle") {
        const diameter = Math.max(width, height);
        width = diameter;
        height = diameter;
      } else if (shape === "rect" && definition?.traits.lockAspect) {
        height = Math.min(width, height);
      }
      get().updateElement(id, { shape, width, height });
    },

    moveElements: (positions) => {
      const state = get();
      const elements = { ...state.scene.elements };
      let changed = false;
      positions.forEach(({ id, x, y }) => {
        const element = elements[id];
        if (!element || element.locked) return;
        const nextX = roundMetres(x);
        const nextY = roundMetres(y);
        if (element.x === nextX && element.y === nextY) return;
        elements[id] = clampElementToCanvas({ ...element, x: nextX, y: nextY }, state.scene.canvas);
        changed = true;
      });
      if (!changed) return;
      commit({ ...state.scene, elements });
    },

    removeSelection: () => {
      const state = get();
      const removable = state.selectedIds.filter((id) => {
        const element = state.scene.elements[id];
        return element && !element.locked;
      });
      if (!removable.length) return;
      const elements = { ...state.scene.elements };
      removable.forEach((id) => delete elements[id]);
      set({
        scene: { ...state.scene, elements },
        selectedIds: [],
        past: [...state.past, state.scene].slice(-HISTORY_LIMIT),
        future: [],
        dirty: true,
      });
    },

    duplicateSelection: () => {
      const state = get();
      const sources = state.selectedIds
        .map((id) => state.scene.elements[id])
        .filter((element): element is FloorPlanElement => Boolean(element));
      if (!sources.length) return;
      const elements = { ...state.scene.elements };
      let zIndex = nextZIndex(state.scene);
      const copies: string[] = [];
      sources.forEach((source) => {
        const copy = clampElementToCanvas(
          {
            ...source,
            id: createSceneId(),
            x: roundMetres(source.x + 0.6),
            y: roundMetres(source.y + 0.6),
            zIndex: zIndex++,
            locked: false,
            style: { ...source.style },
            label: { ...source.label },
            props: { ...source.props },
          },
          state.scene.canvas,
        );
        elements[copy.id] = copy;
        copies.push(copy.id);
      });
      set({
        scene: { ...state.scene, elements },
        selectedIds: copies,
        past: [...state.past, state.scene].slice(-HISTORY_LIMIT),
        future: [],
        dirty: true,
      });
    },

    copySelection: () => {
      const state = get();
      clipboard = state.selectedIds
        .map((id) => state.scene.elements[id])
        .filter((element): element is FloorPlanElement => Boolean(element))
        .map((element) => ({
          ...element,
          style: { ...element.style },
          label: { ...element.label },
          props: { ...element.props },
        }));
    },

    pasteClipboard: () => {
      const state = get();
      if (!clipboard.length) return;
      const elements = { ...state.scene.elements };
      let zIndex = nextZIndex(state.scene);
      const copies: string[] = [];
      clipboard.forEach((source) => {
        const copy = clampElementToCanvas(
          {
            ...source,
            id: createSceneId(),
            x: roundMetres(source.x + 0.75),
            y: roundMetres(source.y + 0.75),
            zIndex: zIndex++,
            locked: false,
            style: { ...source.style },
            label: { ...source.label },
            props: { ...source.props },
          },
          state.scene.canvas,
        );
        elements[copy.id] = copy;
        copies.push(copy.id);
      });
      set({
        scene: { ...state.scene, elements },
        selectedIds: copies,
        past: [...state.past, state.scene].slice(-HISTORY_LIMIT),
        future: [],
        dirty: true,
      });
    },

    toggleLock: (id) => {
      const state = get();
      const element = state.scene.elements[id];
      if (!element) return;
      commit({
        ...state.scene,
        elements: {
          ...state.scene.elements,
          [id]: { ...element, locked: !element.locked },
        },
      });
    },

    nudgeSelection: (dx, dy) => {
      const state = get();
      if (!state.selectedIds.length) return;
      const elements = { ...state.scene.elements };
      let changed = false;
      state.selectedIds.forEach((id) => {
        const element = elements[id];
        if (!element || element.locked) return;
        elements[id] = clampElementToCanvas(
          {
            ...element,
            x: roundMetres(element.x + dx),
            y: roundMetres(element.y + dy),
          },
          state.scene.canvas,
        );
        changed = true;
      });
      if (!changed) return;
      commit({ ...state.scene, elements });
    },

    reorderSelection: (direction) => {
      const state = get();
      if (!state.selectedIds.length) return;
      const elements = { ...state.scene.elements };
      const step = direction === "forward" ? 1 : -1;
      state.selectedIds.forEach((id) => {
        const element = elements[id];
        if (!element) return;
        elements[id] = { ...element, zIndex: Math.max(0, element.zIndex + step) };
      });
      commit({ ...state.scene, elements });
    },

    setCanvasSettings: (patch) => {
      const state = get();
      const canvas = {
        ...state.scene.canvas,
        ...patch,
        background: { ...state.scene.canvas.background, ...patch.background },
      };
      canvas.width = roundMetres(
        clamp(canvas.width, CANVAS_LIMITS.minWidth, CANVAS_LIMITS.maxWidth),
      );
      canvas.height = roundMetres(
        clamp(canvas.height, CANVAS_LIMITS.minHeight, CANVAS_LIMITS.maxHeight),
      );
      canvas.grid = clamp(canvas.grid, 0.1, 2);
      const elements = Object.fromEntries(
        Object.entries(state.scene.elements).map(([id, element]) => [
          id,
          clampElementToCanvas(element, canvas),
        ]),
      );
      commit({ ...state.scene, canvas, elements });
    },

    autoArrange: () => {
      const state = get();
      const next = arrangeTables(state.scene);
      if (next === state.scene) return;
      commit({ ...next, updatedAt: Date.now() });
    },

    markSaved: () => set({ dirty: false, savedAt: Date.now() }),

    undo: () => {
      const state = get();
      const previous = state.past[state.past.length - 1];
      if (!previous) return;
      set({
        scene: previous,
        past: state.past.slice(0, -1),
        future: [state.scene, ...state.future].slice(0, HISTORY_LIMIT),
        selectedIds: state.selectedIds.filter((id) => previous.elements[id]),
        dirty: true,
        liveTransform: null,
      });
    },

    redo: () => {
      const state = get();
      const next = state.future[0];
      if (!next) return;
      set({
        scene: next,
        past: [...state.past, state.scene].slice(-HISTORY_LIMIT),
        future: state.future.slice(1),
        selectedIds: state.selectedIds.filter((id) => next.elements[id]),
        dirty: true,
        liveTransform: null,
      });
    },
  };
});

export function usePrimarySelection() {
  const selectedIds = useFloorPlanStore((state) => state.selectedIds);
  const elements = useFloorPlanStore((state) => state.scene.elements);
  const id = selectedIds[selectedIds.length - 1];
  return id ? elements[id] ?? null : null;
}
