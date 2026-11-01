import { CANVAS_LIMITS } from "./constants";
import { resolveDefinition } from "./scene";
import type {
  FloorPlanCanvasSettings,
  FloorPlanElement,
  FloorPlanGuide,
  FloorPlanScene,
  FloorPlanStats,
  FloorPlanWarning,
  SeatPosition,
} from "./types";

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function roundMetres(value: number) {
  return Math.round(value * 100) / 100;
}

export function roundAngle(value: number) {
  return Math.round(value);
}

export function normalizeRotation(value: number) {
  const next = value % 360;
  return next < 0 ? next + 360 : next;
}

export function snapToGrid(value: number, grid: number) {
  if (grid <= 0) return value;
  return Math.round(value / grid) * grid;
}

export function rotatePoint(x: number, y: number, degrees: number) {
  const radians = (degrees * Math.PI) / 180;
  return {
    x: x * Math.cos(radians) - y * Math.sin(radians),
    y: x * Math.sin(radians) + y * Math.cos(radians),
  };
}

/** Rotated footprint, as min/max metres. */
export function elementBounds(element: Pick<FloorPlanElement, "x" | "y" | "width" | "height" | "rotation">) {
  const halfWidth = element.width / 2;
  const halfHeight = element.height / 2;
  const corners = [
    [-halfWidth, -halfHeight],
    [halfWidth, -halfHeight],
    [halfWidth, halfHeight],
    [-halfWidth, halfHeight],
  ].map(([x, y]) => {
    const rotated = rotatePoint(x, y, element.rotation);
    return { x: element.x + rotated.x, y: element.y + rotated.y };
  });

  return {
    left: Math.min(...corners.map((corner) => corner.x)),
    right: Math.max(...corners.map((corner) => corner.x)),
    top: Math.min(...corners.map((corner) => corner.y)),
    bottom: Math.max(...corners.map((corner) => corner.y)),
    width: Math.max(...corners.map((corner) => corner.x)) - Math.min(...corners.map((corner) => corner.x)),
    height: Math.max(...corners.map((corner) => corner.y)) - Math.min(...corners.map((corner) => corner.y)),
    corners,
  };
}

export function boundsOverlap(
  a: { left: number; right: number; top: number; bottom: number },
  b: { left: number; right: number; top: number; bottom: number },
) {
  const width = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  if (width <= 0 || height <= 0) return 0;
  return width * height;
}

export function clampElementSize(element: FloorPlanElement): FloorPlanElement {
  return {
    ...element,
    width: Math.max(CANVAS_LIMITS.minElement, roundMetres(element.width)),
    height: Math.max(CANVAS_LIMITS.minElement, roundMetres(element.height)),
  };
}

/** Keeps the whole rotated footprint inside the venue. */
export function clampElementToCanvas(
  element: FloorPlanElement,
  canvas: FloorPlanCanvasSettings,
): FloorPlanElement {
  const sized = clampElementSize(element);
  const bounds = elementBounds(sized);
  const halfWidth = bounds.width / 2;
  const halfHeight = bounds.height / 2;

  const x =
    halfWidth * 2 >= canvas.width
      ? canvas.width / 2
      : clamp(sized.x, halfWidth, canvas.width - halfWidth);
  const y =
    halfHeight * 2 >= canvas.height
      ? canvas.height / 2
      : clamp(sized.y, halfHeight, canvas.height - halfHeight);

  return { ...sized, x: roundMetres(x), y: roundMetres(y) };
}

export function snapPosition(
  x: number,
  y: number,
  element: Pick<FloorPlanElement, "width" | "height" | "rotation">,
  scene: FloorPlanScene,
  enabled: boolean,
) {
  if (!enabled) return { x: roundMetres(x), y: roundMetres(y) };
  const grid = scene.canvas.grid;
  const snappedX = roundMetres(snapToGrid(x, grid));
  const snappedY = roundMetres(snapToGrid(y, grid));
  const bounds = elementBounds({ ...element, x: snappedX, y: snappedY });
  // Snap the footprint edge to the venue edge once the item is within half a
  // grid step, so tables and stages line up with walls.
  const tolerance = grid / 2;
  let nextX = snappedX;
  let nextY = snappedY;
  if (Math.abs(bounds.left) < tolerance) nextX += -bounds.left;
  if (Math.abs(bounds.top) < tolerance) nextY += -bounds.top;
  if (Math.abs(bounds.right - scene.canvas.width) < tolerance)
    nextX -= bounds.right - scene.canvas.width;
  if (Math.abs(bounds.bottom - scene.canvas.height) < tolerance)
    nextY -= bounds.bottom - scene.canvas.height;
  return { x: roundMetres(nextX), y: roundMetres(nextY) };
}

/** Centre/edge alignment against other items, in metres. */
export function alignmentSnap(
  x: number,
  y: number,
  element: FloorPlanElement,
  scene: FloorPlanScene,
  tolerance: number,
): { x: number; y: number; guides: FloorPlanGuide[] } {
  const others = Object.values(scene.elements).filter((item) => item.id !== element.id);
  const guides: FloorPlanGuide[] = [];
  let bestX = { distance: tolerance, at: x, guide: null as number | null };
  let bestY = { distance: tolerance, at: y, guide: null as number | null };

  others.forEach((other) => {
    const otherBounds = elementBounds(other);
    const candidatesX = [
      other.x,
      otherBounds.left + element.width / 2,
      otherBounds.right - element.width / 2,
    ];
    const candidatesY = [
      other.y,
      otherBounds.top + element.height / 2,
      otherBounds.bottom - element.height / 2,
    ];
    candidatesX.forEach((candidate) => {
      const distance = Math.abs(candidate - x);
      if (distance < bestX.distance) bestX = { distance, at: candidate, guide: other.x };
    });
    candidatesY.forEach((candidate) => {
      const distance = Math.abs(candidate - y);
      if (distance < bestY.distance) bestY = { distance, at: candidate, guide: other.y };
    });
  });

  if (bestX.guide !== null) guides.push({ axis: "x", at: bestX.guide });
  if (bestY.guide !== null) guides.push({ axis: "y", at: bestY.guide });
  return { x: roundMetres(bestX.at), y: roundMetres(bestY.at), guides };
}

export function seatCountFor(element: FloorPlanElement, scene: FloorPlanScene) {
  const definition = resolveDefinition(scene.definitions, element.definitionId);
  const trait = definition?.traits.seats;
  if (!trait) return 0;
  const requested = Number(element.props.seats ?? trait.default);
  if (!Number.isFinite(requested)) return trait.default;
  return clamp(Math.round(requested), trait.min, trait.max);
}

/** Absolute chair positions for a table; labels already rotated with the item. */
export function seatPositions(element: FloorPlanElement, scene: FloorPlanScene): SeatPosition[] {
  const definition = resolveDefinition(scene.definitions, element.definitionId);
  const trait = definition?.traits.seats;
  if (!trait || trait.layout === "single") return [];
  const count = seatCountFor(element, scene);
  const positions: SeatPosition[] = [];
  const rotation = (element.rotation * Math.PI) / 180;

  const place = (localX: number, localY: number, chairRotation: number) => {
    const x = localX * Math.cos(rotation) - localY * Math.sin(rotation);
    const y = localX * Math.sin(rotation) + localY * Math.cos(rotation);
    positions.push({ x: element.x + x, y: element.y + y, rotation: element.rotation + chairRotation });
  };

  if (trait.layout === "ring") {
    const radius = Math.max(element.width, element.height) / 2 + 0.32;
    for (let index = 0; index < count; index += 1) {
      const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
      place(Math.cos(angle) * radius, Math.sin(angle) * radius, (angle * 180) / Math.PI + 90);
    }
    return positions;
  }

  if (trait.layout === "sides") {
    const vertical = element.height >= element.width;
    if (vertical) {
      const perSide = Math.ceil(count / 2);
      for (let index = 0; index < count; index += 1) {
        const side = index % 2 === 0 ? -1 : 1;
        const slot = Math.floor(index / 2);
        const y = (slot - (perSide - 1) / 2) * (element.height / Math.max(1, perSide));
        place(side * (element.width / 2 + 0.34), y, side < 0 ? -90 : 90);
      }
    } else {
      const perSide = Math.ceil(count / 2);
      for (let index = 0; index < count; index += 1) {
        const side = index % 2 === 0 ? -1 : 1;
        const slot = Math.floor(index / 2);
        const x = (slot - (perSide - 1) / 2) * (element.width / Math.max(1, perSide));
        place(x, side * (element.height / 2 + 0.34), side < 0 ? 0 : 180);
      }
    }
    return positions;
  }

  for (let index = 0; index < count; index += 1) {
    const x = (index - (count - 1) / 2) * 0.7;
    place(x, element.height / 2 + 0.32, 180);
  }
  return positions;
}

export function getSceneStats(scene: FloorPlanScene): FloorPlanStats {
  const elements = Object.values(scene.elements);
  let tables = 0;
  let seats = 0;
  let zones = 0;

  elements.forEach((element) => {
    const definition = resolveDefinition(scene.definitions, element.definitionId);
    if (!definition) return;
    if (definition.traits.zone) zones += 1;
    if (definition.traits.seats && definition.traits.seats.layout !== "single") {
      tables += 1;
      seats += seatCountFor(element, scene);
    }
  });

  return {
    elements: elements.length,
    tables,
    seats,
    zones,
    width: scene.canvas.width,
    height: scene.canvas.height,
    capacity: seats,
  };
}

function isSolid(element: FloorPlanElement, scene: FloorPlanScene) {
  const definition = resolveDefinition(scene.definitions, element.definitionId);
  if (!definition) return false;
  return !definition.traits.zone && !definition.traits.marker && !definition.traits.entrance;
}

export function getSceneWarnings(scene: FloorPlanScene): FloorPlanWarning[] {
  const warnings: FloorPlanWarning[] = [];
  const elements = Object.values(scene.elements);

  elements.forEach((element) => {
    const definition = resolveDefinition(scene.definitions, element.definitionId);
    if (!definition) return;
    const bounds = elementBounds(element);
    if (
      bounds.left < -0.01 ||
      bounds.top < -0.01 ||
      bounds.right > scene.canvas.width + 0.01 ||
      bounds.bottom > scene.canvas.height + 0.01
    ) {
      warnings.push({
        kind: "outside",
        severity: "medium",
        message: `${element.label.text || definition.name} extends past the venue boundary.`,
        elementIds: [element.id],
      });
    }
  });

  for (let i = 0; i < elements.length; i += 1) {
    const left = elements[i];
    if (!isSolid(left, scene)) continue;
    const leftDefinition = resolveDefinition(scene.definitions, left.definitionId);
    if (leftDefinition?.traits.container) continue;
    for (let j = i + 1; j < elements.length; j += 1) {
      const right = elements[j];
      if (!isSolid(right, scene)) continue;
      const rightDefinition = resolveDefinition(scene.definitions, right.definitionId);
      if (rightDefinition?.traits.container) continue;
      const overlap = boundsOverlap(elementBounds(left), elementBounds(right));
      if (overlap > 0.6) {
        warnings.push({
          kind: "overlap",
          severity: overlap > 2 ? "high" : "low",
          message: `${left.label.text || leftDefinition?.name || "Item"} overlaps ${
            right.label.text || rightDefinition?.name || "another item"
          }.`,
          elementIds: [left.id, right.id],
        });
      }
    }
  }

  const exits = elements.filter((element) => {
    const definition = resolveDefinition(scene.definitions, element.definitionId);
    return definition?.traits.entrance;
  });
  exits.forEach((exit) => {
    const bounds = elementBounds(exit);
    const clearance = 1.1;
    const blocked = elements.some((element) => {
      if (element.id === exit.id || !isSolid(element, scene)) return false;
      const definition = resolveDefinition(scene.definitions, element.definitionId);
      if (definition?.traits.container) return false;
      const other = elementBounds(element);
      return (
        boundsOverlap(
          {
            left: bounds.left - clearance,
            right: bounds.right + clearance,
            top: bounds.top - clearance,
            bottom: bounds.bottom + clearance,
          },
          other,
        ) > 0.2
      );
    });
    if (blocked) {
      warnings.push({
        kind: "blocked-exit",
        severity: "high",
        message: `${exit.label.text || "An entrance"} has less than 1.1 m of clearance.`,
        elementIds: [exit.id],
      });
    }
  });

  elements.forEach((element) => {
    const definition = resolveDefinition(scene.definitions, element.definitionId);
    if (!definition?.traits.zone) return;
    if (element.width < 1.1 || element.height < 1.1) {
      warnings.push({
        kind: "clearance",
        severity: "low",
        message: `${element.label.text || definition.name} is narrower than a safe walkway.`,
        elementIds: [element.id],
      });
    }
  });

  const stats = getSceneStats(scene);
  if (scene.guestCount && scene.guestCount > stats.seats && scene.guestCount > 0) {
    warnings.push({
      kind: "capacity",
      severity: "high",
      message: `${scene.guestCount - stats.seats} guests have no seat at the current table count.`,
      elementIds: [],
    });
  }

  const rank = { high: 0, medium: 1, low: 2 } as const;
  return warnings.sort((a, b) => rank[a.severity] - rank[b.severity]).slice(0, 24);
}

export function describeWarningCount(warnings: FloorPlanWarning[]) {
  const high = warnings.filter((warning) => warning.severity === "high").length;
  const medium = warnings.filter((warning) => warning.severity === "medium").length;
  if (high > 0) return `${high} critical issue${high === 1 ? "" : "s"}`;
  if (medium > 0) return `${medium} check${medium === 1 ? "" : "s"} recommended`;
  if (warnings.length > 0) return `${warnings.length} minor note${warnings.length === 1 ? "" : "s"}`;
  return "Plan looks clear";
}

/** Total usable area and density, used by the summary strip. */
export function getDensity(scene: FloorPlanScene) {
  const area = scene.canvas.width * scene.canvas.height;
  const guests = scene.guestCount ?? 0;
  return {
    area: Math.round(area),
    perGuest: guests > 0 ? area / guests : 0,
  };
}
