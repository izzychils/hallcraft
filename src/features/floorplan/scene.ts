import { DEFAULT_CANVAS, DEFINITION_BY_ID } from "./constants";
import type {
  FloorPlanDefinition,
  FloorPlanElement,
  FloorPlanScene,
} from "./types";

export function createSceneId() {
  return `el_${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyScene(
  name = "Untitled layout",
  width: number = DEFAULT_CANVAS.width,
  height: number = DEFAULT_CANVAS.height,
): FloorPlanScene {
  return {
    schema: 1,
    unit: "m",
    name,
    venueName: "",
    eventType: "Corporate",
    guestCount: 0,
    canvas: {
      width,
      height,
      grid: DEFAULT_CANVAS.grid,
      background: { color: DEFAULT_CANVAS.background.color },
    },
    elements: {},
    definitions: {},
    version: 1,
    updatedAt: Date.now(),
  };
}

export function resolveDefinition(
  definitions: Record<string, FloorPlanDefinition>,
  id: string,
): FloorPlanDefinition | null {
  return definitions[id] ?? DEFINITION_BY_ID[id] ?? null;
}

export function createElementFromDefinition(
  definition: FloorPlanDefinition,
  x: number,
  y: number,
  zIndex: number,
): FloorPlanElement {
  const seats = definition.traits.seats?.default;
  return {
    id: createSceneId(),
    definitionId: definition.id,
    x,
    y,
    width: definition.defaultWidth,
    height: definition.defaultHeight,
    rotation: 0,
    zIndex,
    locked: false,
    style: { ...definition.defaultStyle },
    label: {
      text: definition.defaultLabel ?? "",
      size: definition.labelSize ?? 0.24,
      rotation: 0,
      visible: Boolean(definition.defaultLabel),
    },
    props: {
      ...(seats !== undefined ? { seats } : {}),
      ...(definition.traits.marker ? { name: definition.name } : {}),
    },
  };
}

export function nextZIndex(scene: FloorPlanScene) {
  return (
    Math.max(0, ...Object.values(scene.elements).map((element) => element.zIndex)) + 1
  );
}

export function cloneScene(scene: FloorPlanScene): FloorPlanScene {
  return JSON.parse(JSON.stringify(scene)) as FloorPlanScene;
}

interface PlaceOptions {
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  label?: string;
  labelRotation?: number;
  labelSize?: number;
  seats?: number;
  fill?: string;
  stroke?: string;
  zIndex?: number;
}

/** Small builder used by templates and the layout generator. */
export function placeElement(
  scene: FloorPlanScene,
  definitionId: string,
  options: PlaceOptions,
): FloorPlanElement | null {
  const definition = resolveDefinition(scene.definitions, definitionId);
  if (!definition) return null;
  const element = createElementFromDefinition(
    definition,
    options.x,
    options.y,
    options.zIndex ?? nextZIndex(scene),
  );
  element.width = options.width ?? element.width;
  element.height = options.height ?? element.height;
  element.rotation = options.rotation ?? 0;
  if (options.seats !== undefined) element.props.seats = options.seats;
  if (options.label !== undefined) {
    element.label.text = options.label;
    element.label.visible = true;
  }
  if (options.labelRotation !== undefined) element.label.rotation = options.labelRotation;
  if (options.labelSize !== undefined) element.label.size = options.labelSize;
  if (options.fill) element.style.fill = options.fill;
  if (options.stroke) element.style.stroke = options.stroke;
  scene.elements[element.id] = element;
  return element;
}

export function tableLabel(index: number) {
  return `T${index + 1}`;
}

/** A short, friendly default name based on the event type and room. */
export function suggestDesignName(eventType: string, venueName: string) {
  const venue = venueName.trim() || "Main hall";
  return `${eventType} · ${venue}`;
}
