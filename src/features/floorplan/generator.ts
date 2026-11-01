import { clamp, getSceneStats, getSceneWarnings, roundMetres } from "./geometry";
import { createEmptyScene, placeElement, resolveDefinition, tableLabel } from "./scene";
import type {
  DesignBrief,
  FloorPlanScene,
  LayoutVariation,
} from "./types";

interface FittedGrid {
  diameter: number;
  columns: number;
  rows: number;
  aisle: boolean;
  positions: Array<{ x: number; y: number }>;
}

const SEATED_TYPES = new Set(["Corporate", "Wedding", "Gala dinner", "Conference"]);

const STYLE_BACKGROUNDS: Record<string, string> = {
  "Modern minimal": "#fbf8f1",
  "Warm editorial": "#f8f0e4",
  "Black tie": "#f1ede6",
  "Garden party": "#f4f6ec",
  Nightlife: "#efe8e8",
  "Brand-led": "#f5f1e9",
};

const STYLE_STAGE: Record<string, string> = {
  "Modern minimal": "#e4d8c6",
  "Warm editorial": "#ddc7aa",
  "Black tie": "#c9bdac",
  "Garden party": "#d8dcc6",
  Nightlife: "#c9bac7",
  "Brand-led": "#d6d1c5",
};

/**
 * A deterministic layout planner. It is intentionally rule-based: the studio
 * presents it as an assistant, but every recommendation can be traced back to
 * room dimensions, capacity and circulation rules.
 */
export function buildLayout(brief: DesignBrief, variant = 0): FloorPlanScene {
  const width = clamp(roundMetres(brief.width || 22), 8, 70);
  const height = clamp(roundMetres(brief.height || 28), 8, 70);
  const guests = Math.max(0, Math.round(brief.guests || 0));
  const eventType = brief.eventType || "Corporate";
  const isSeated = SEATED_TYPES.has(eventType);
  const variantName = ["Balanced", "Social", "Capacity-first"][variant] ?? "Balanced";

  const scene = createEmptyScene(`${eventType} · Level 1`, width, height);
  scene.venueName = extractVenue(brief.brief) || "Main hall";
  scene.eventType = eventType;
  scene.guestCount = guests;
  scene.canvas.background = {
    color: STYLE_BACKGROUNDS[brief.style] ?? STYLE_BACKGROUNDS["Modern minimal"],
  };
  const stageFill = STYLE_STAGE[brief.style] ?? STYLE_STAGE["Modern minimal"];

  const isConference = eventType === "Conference";
  const isWedding = eventType === "Wedding";
  const isStanding = !isSeated;
  const margin = width < 14 ? 1.1 : 1.6;
  const stageWidth = clamp(
    width * (variant === 1 ? 0.34 : variant === 2 ? 0.38 : 0.42),
    width < 14 ? 4 : 5.4,
    isWedding ? 8 : 12,
  );
  const stageHeight = isWedding ? 2.4 : 3;
  const stageCenterY = 2.2 + stageHeight / 2;
  const topZone = stageCenterY + stageHeight / 2;

  const danceSize = clamp(width * 0.26, 4.4, isConference ? 0 : 7.2) *
    (variant === 1 ? 1.18 : variant === 2 ? 0.86 : 1);

  // Floor-level zones go in first so they sit beneath the furniture.
  const hasDance = !isConference && !isStanding && !isWedding;
  const danceY = topZone + 3 + danceSize / 2;
  if (hasDance) {
    placeElement(scene, "dance_floor", {
      x: width / 2,
      y: danceY,
      width: danceSize,
      height: danceSize,
      label: "DANCE",
      labelSize: 0.28,
    });
  }

  const tableTop = isStanding
    ? topZone + 3
    : hasDance
      ? danceY + danceSize / 2 + 1.7
      : isWedding
        ? topZone + 2.4
        : topZone + 2.6;
  const tableBottom = height - (isStanding ? 2.2 : 2.6);

  if (isWedding) {
    placeElement(scene, "stage", {
      x: width / 2,
      y: stageCenterY,
      width: stageWidth,
      height: stageHeight,
      label: "ALTAR",
      labelSize: 0.38,
      fill: stageFill,
    });
    placeElement(scene, "flowers", { x: width / 2 - stageWidth / 2 - 0.6, y: stageCenterY });
    placeElement(scene, "flowers", { x: width / 2 + stageWidth / 2 + 0.6, y: stageCenterY });
    placeElement(scene, "walkway", {
      x: width / 2,
      y: (topZone + height - 1.8) / 2,
      width: 1.8,
      height: Math.max(3, height - topZone - 3.2),
      label: "AISLE",
      labelRotation: 90,
      labelSize: 0.18,
    });
  } else {
    placeElement(scene, "lighting", {
      x: width / 2,
      y: 1.25,
      width: clamp(stageWidth + 1.4, 5, width - 2),
      label: "LIGHTS",
      labelSize: 0.16,
    });
    placeElement(scene, "stage", {
      x: width / 2,
      y: stageCenterY,
      width: stageWidth,
      height: stageHeight,
      label: isConference ? "KEYNOTE STAGE" : eventType === "Gala dinner" ? "MAIN STAGE" : "STAGE",
      labelSize: 0.4,
      fill: stageFill,
    });
    placeElement(scene, "screen", {
      x: width / 2,
      y: stageCenterY - stageHeight / 2 - 0.5,
      width: Math.min(stageWidth - 1.6, 8),
      height: 0.28,
      label: "SCREEN",
      labelSize: 0.16,
    });
    placeElement(scene, "speaker", {
      x: width / 2 - stageWidth / 2 - 0.9,
      y: stageCenterY,
    });
    placeElement(scene, "speaker", {
      x: width / 2 + stageWidth / 2 + 0.9,
      y: stageCenterY,
    });
  }

  // Arrival is always bottom-centre; side exits are added to larger rooms.
  placeElement(scene, "entrance", {
    x: width / 2,
    y: height - 0.85,
    width: clamp(width * 0.25, 3.6, 6.4),
    height: 1.35,
    label: isWedding ? "ARRIVAL" : "ENTRANCE",
  });
  if (width >= 19) {
    placeElement(scene, "exit", {
      x: width - 1.2,
      y: height / 2,
      width: 1.4,
      height: 0.6,
      rotation: 90,
      label: "EXIT",
      labelSize: 0.16,
    });
    placeElement(scene, "registration_desk", {
      x: margin + 1.8,
      y: height - 2.8,
      width: 3,
      label: "CHECK-IN",
      labelSize: 0.18,
    });
  }

  const sideSpace = (width - stageWidth) / 2;
  if (sideSpace >= 4.6 && !isWedding) {
    placeElement(scene, "bar", {
      x: sideSpace / 2 + 0.4,
      y: stageCenterY,
      width: Math.min(4.2, sideSpace - 0.8),
      height: 1.25,
      rotation: 90,
      label: "BAR",
      labelSize: 0.2,
    });
    placeElement(scene, "bar", {
      x: width - sideSpace / 2 - 0.4,
      y: stageCenterY,
      width: Math.min(4.2, sideSpace - 0.8),
      height: 1.25,
      rotation: 90,
      label: "BAR",
      labelSize: 0.2,
    });
  }

  if (isSeated) {
    const seatsPerTable = isWedding ? 10 : 10;
    const requestedTables = Math.max(1, Math.ceil(guests / seatsPerTable));
    const tableArea = {
      x: margin,
      y: tableTop,
      width: width - margin * 2,
      height: Math.max(2, tableBottom - tableTop),
    };

    if (isConference) {
      addConferenceRows(scene, tableArea, requestedTables, width, height, stageCenterY + stageHeight / 2);
    } else {
      const grid = fitTables(tableArea, requestedTables, variant);
      grid.positions.forEach((position, index) => {
        const diameter = grid.aisle
          ? Math.min(grid.diameter, 3.2)
          : grid.diameter;
        placeElement(scene, "round_table", {
          x: position.x,
          y: position.y,
          width: diameter,
          height: diameter,
          seats: seatsPerTable,
          label: tableLabel(index),
          labelSize: diameter < 2.6 ? 0.18 : 0.22,
        });
      });

      if (grid.aisle) {
        placeElement(scene, "walkway", {
          x: width / 2,
          y: (tableTop + tableBottom) / 2,
          width: 1.8,
          height: Math.max(2.4, tableBottom - tableTop),
          label: "AISLE",
          labelRotation: 90,
          labelSize: 0.16,
          zIndex: 0,
        });
      }
    }

    if (isWedding) {
      placeElement(scene, "buffet_station", {
        x: width - margin - 1,
        y: tableTop + 2.2,
        width: 3.6,
        height: 1.2,
        rotation: 90,
        label: "SUPPER",
        labelSize: 0.18,
      });
      placeElement(scene, "photobooth", {
        x: width - margin - 1.6,
        y: stageCenterY + 0.4,
        width: 3,
        height: 2.4,
        label: "PHOTO",
        labelSize: 0.18,
      });
    }
  } else if (eventType === "Conference") {
    // Handled above; this branch only guards future types.
  } else if (eventType === "Exhibition") {
    addExhibition(scene, { width, height, margin, guests });
  } else if (eventType === "Concert") {
    addConcert(scene, { width, height, margin, guests, stageTop: topZone, stageWidth });
  } else {
    addStandingReception(scene, {
      width,
      height,
      margin,
      guests,
      tableTop,
      tableBottom,
      eventType,
      variant,
    });
  }

  // VIP corner, plants and service markers are only added when they fit.
  if (!isStanding && width >= 18 && height >= 22 && !isConference) {
    placeElement(scene, "vip_area", {
      x: width - margin - 2,
      y: height - (isWedding ? 5.4 : 7.4),
      width: 4.2,
      height: 3.4,
      label: "VIP",
      labelSize: 0.26,
      zIndex: 0,
    });
  }

  const cornerClearance = isWedding ? 0 : 1.1;
  [
    [margin * 0.7, margin * 0.7 + cornerClearance],
    [width - margin * 0.7, margin * 0.7 + cornerClearance],
    [margin * 0.7, height - margin * 0.7],
    [width - margin * 0.7, height - margin * 0.7],
  ].forEach(([x, y], index) => {
    if (eventType === "Exhibition" || eventType === "Conference") return;
    if (index === 3 && width < 18) return;
    placeElement(scene, "plant", { x, y });
  });

  if (eventType === "Corporate" || eventType === "Gala dinner") {
    placeElement(scene, "security", { x: width / 2 - 2.4, y: height - 2.4 });
    placeElement(scene, "technical", { x: width / 2 + 2.4, y: height - 2.4 });
  }

  scene.version = 1;
  scene.updatedAt = Date.now();
  scene.name = `${eventType} · ${variantName} layout`;
  return scene;
}

function extractVenue(brief: string) {
  const match = brief.match(/\b(?:at|in)\s+(?:the\s+)?([A-Z][\w'&-]*(?:\s+[A-Z][\w'&-]*){0,2})/);
  return match?.[1] ?? "";
}

function fitTables(
  area: { x: number; y: number; width: number; height: number },
  count: number,
  variant: number,
): FittedGrid {
  const aisleWidth = 1.9;
  const diameters = [3.4, 3.2, 3, 2.8, 2.6, 2.4, 2.2, 2];
  const gap = variant === 2 ? 0.5 : 0.75;
  const tryAisle = variant !== 2 && area.width >= 12;

  const attempt = (diameter: number, withAisle: boolean): FittedGrid | null => {
    const usableWidth = withAisle ? area.width - aisleWidth - 1.2 : area.width;
    const columns = Math.floor((usableWidth + gap) / (diameter + gap));
    if (columns < 1) return null;
    const rows = Math.ceil(count / columns);
    const neededHeight = rows * (diameter + gap) - gap;
    if (neededHeight > area.height + 0.01) return null;

    const leftWidth = withAisle ? (usableWidth - 1.2) / 2 : usableWidth;
    const columnsPerSide = withAisle ? Math.floor((leftWidth + gap) / (diameter + gap)) : columns;
    if (columnsPerSide < 1) return null;

    const effectiveColumns = withAisle ? columnsPerSide * 2 : columnsPerSide;
    const effectiveRows = Math.ceil(count / effectiveColumns);
    if (effectiveRows > rows + 1) return null;

    const usedHeight = effectiveRows * (diameter + gap) - gap;
    const startY = area.y + (area.height - usedHeight) / 2;
    const leftStartX = withAisle
      ? area.x + (leftWidth - (columnsPerSide * (diameter + gap) - gap)) / 2
      : area.x;
    const rightStartX = withAisle ? area.x + area.width - leftWidth + (leftWidth - (columnsPerSide * (diameter + gap) - gap)) / 2 : 0;

    if (effectiveRows * (diameter + gap) - gap > area.height + 0.01) return null;

    const positions: Array<{ x: number; y: number }> = [];
    for (let index = 0; index < count; index += 1) {
      const row = Math.floor(index / effectiveColumns);
      const column = index % effectiveColumns;
      const onRight = withAisle && column >= columnsPerSide;
      const sideColumn = onRight ? column - columnsPerSide : column;
      const x = withAisle
        ? (onRight ? rightStartX : leftStartX) + sideColumn * (diameter + gap) + diameter / 2
        : area.x + (area.width - (columnsPerSide * (diameter + gap) - gap)) / 2 + sideColumn * (diameter + gap) + diameter / 2;
      const y = startY + row * (diameter + gap) + diameter / 2;
      positions.push({ x: roundMetres(x), y: roundMetres(y) });
    }

    return {
      diameter,
      columns: effectiveColumns,
      rows: effectiveRows,
      aisle: withAisle,
      positions,
    };
  };

  for (const diameter of diameters) {
    if (tryAisle) {
      const withAisle = attempt(diameter, true);
      if (withAisle) return withAisle;
    }
    const full = attempt(diameter, false);
    if (full) return full;
  }

  // Even the smallest table does not fit: use the smallest and keep items
  // inside the room so the planner can report the capacity shortfall.
  const fallback = attempt(2, false) ?? {
    diameter: 2,
    columns: 1,
    rows: count,
    aisle: false,
    positions: [] as Array<{ x: number; y: number }>,
  };
  if (fallback.positions.length) return fallback;

  const positions = Array.from({ length: count }, (_, index) => ({
    x: roundMetres(area.x + area.width / 2),
    y: roundMetres(
      area.y + Math.min(area.height - 1, (index + 0.5) * Math.min(2.2, area.height / Math.max(1, count))),
    ),
  }));
  return { diameter: 2, columns: 1, rows: count, aisle: false, positions };
}

function addConferenceRows(
  scene: FloorPlanScene,
  area: { x: number; y: number; width: number; height: number },
  tableCount: number,
  width: number,
  height: number,
  stageBottom: number,
) {
  const aisle = 2;
  const blockWidth = (area.width - aisle - 0.8) / 2;
  const rows = Math.ceil(tableCount / 2);
  const rowHeight = Math.min(1.3, Math.max(0.9, area.height / rows - 0.85));
  const rowGap = Math.max(
    0.4,
    Math.min(0.85, (area.height - rows * rowHeight) / Math.max(1, rows - 1)),
  );
  const usedHeight = rows * (rowHeight + rowGap) - rowGap;
  const startY = area.y + Math.max(0, (area.height - usedHeight) / 2);
  const leftX = area.x + blockWidth / 2;
  const rightX = width - area.x - blockWidth / 2;

  placeElement(scene, "walkway", {
    x: width / 2,
    y: (stageBottom + area.y + area.height) / 2,
    width: aisle,
    height: Math.max(4, area.height + 4),
    label: "AISLE",
    labelRotation: 90,
    labelSize: 0.16,
    zIndex: 0,
  });

  for (let index = 0; index < tableCount; index += 1) {
    const row = Math.floor(index / 2);
    const side = index % 2;
    placeElement(scene, "rect_table", {
      x: side === 0 ? leftX : rightX,
      y: startY + row * (rowHeight + rowGap) + rowHeight / 2,
      width: blockWidth,
      height: rowHeight,
      seats: 10,
      label: `ROW ${String(row + 1).padStart(2, "0")}`,
      labelSize: 0.16,
    });
  }

  placeElement(scene, "bar", {
    x: 2.1,
    y: height - 5.6,
    width: 3.8,
    height: 1.1,
    rotation: 90,
    label: "COFFEE",
    labelSize: 0.16,
  });
  placeElement(scene, "bar", {
    x: width - 2.1,
    y: height - 5.6,
    width: 3.8,
    height: 1.1,
    rotation: 90,
    label: "COFFEE",
    labelSize: 0.16,
  });
}

function addStandingReception(
  scene: FloorPlanScene,
  options: {
    width: number;
    height: number;
    margin: number;
    guests: number;
    tableTop: number;
    tableBottom: number;
    eventType: string;
    variant: number;
  },
) {
  const { width, height, margin, guests, tableTop, tableBottom, eventType, variant } = options;

  if (width >= 19) {
    const podCount = 4;
    for (let index = 0; index < podCount; index += 1) {
      const y = tableTop + 1.6 + index * 3.2;
      if (y > tableBottom - 1) break;
      placeElement(scene, "rect_table", {
        x: margin + 1.3,
        y,
        width: 2.4,
        height: 1.3,
        label: `POD 0${index + 1}`,
        labelSize: 0.14,
        seats: 2,
      });
      placeElement(scene, "rect_table", {
        x: width - margin - 1.3,
        y,
        width: 2.4,
        height: 1.3,
        label: `POD 0${index + 5}`,
        labelSize: 0.14,
        seats: 2,
      });
    }
  }

  const count = clamp(Math.ceil(guests / 22), 4, 14);
  const columns = Math.max(2, Math.floor((width - margin * 2) / 4));
  const rows = Math.ceil(count / columns);
  const areaHeight = Math.max(3, tableBottom - tableTop);
  const startX = width / 2 - ((Math.min(columns, count) - 1) * 3.6) / 2;
  const startY = tableTop + Math.min(2, areaHeight / 2);

  for (let index = 0; index < count; index += 1) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    placeElement(scene, "cocktail_table", {
      x: startX + column * 3.6,
      y: startY + row * Math.min(3.2, areaHeight / Math.max(1, rows)),
      width: 1.1,
      height: 1.1,
    });
  }

  if (eventType === "Private party") {
    placeElement(scene, "dj_booth", {
      x: width / 2,
      y: tableTop - 1.2,
      width: 3.2,
      height: 1.4,
      label: "DJ",
    });
  }

  if (eventType !== "Concert") {
    placeElement(scene, "sofa_set", {
      x: margin + 1.4,
      y: Math.min(height - 4.2, tableBottom + 1.4),
      width: 2.2,
      height: 3.2,
      rotation: 90,
      label: "LOUNGE",
      labelSize: 0.16,
    });
    placeElement(scene, "sofa_set", {
      x: width - margin - 1.4,
      y: Math.min(height - 4.2, tableBottom + 1.4),
      width: 2.2,
      height: 3.2,
      rotation: 90,
      label: "LOUNGE",
      labelSize: 0.16,
    });
  }

  if (variant === 1) {
    placeElement(scene, "photobooth", {
      x: width - margin - 1.8,
      y: tableTop + 3.4,
      width: 3.2,
      height: 2.4,
      label: "PHOTO",
      labelSize: 0.18,
    });
  }
}

function addExhibition(
  scene: FloorPlanScene,
  options: { width: number; height: number; margin: number; guests: number },
) {
  const { width, height, margin, guests } = options;
  const count = clamp(Math.ceil(guests / 40), 6, 18);
  const columns = width >= 26 ? 4 : 2;
  const rows = Math.ceil(count / columns);
  const top = 8.2;
  const bottom = height - 3.4;
  const centralAisle = 2.8;
  const blockWidth = (width - margin * 2 - centralAisle) / 2;
  const boothWidth = columns === 4 ? Math.min(3.4, blockWidth / 2 - 0.4) : Math.min(4.2, blockWidth - 1);
  const boothHeight = Math.min(2.4, Math.max(1.6, (bottom - top) / Math.max(1, rows) - 0.7));

  placeElement(scene, "walkway", {
    x: width / 2,
    y: (top + bottom) / 2,
    width: centralAisle,
    height: Math.max(6, bottom - top + 1),
    label: "CENTRAL AISLE",
    labelRotation: 90,
    labelSize: 0.2,
    zIndex: 0,
  });

  let index = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if (index >= count) break;
      const onRight = column >= columns / 2;
      const sideColumn = onRight ? column - columns / 2 : column;
      const perSide = Math.floor(columns / 2);
      const x = onRight
        ? width / 2 + centralAisle / 2 + 1.2 + sideColumn * (boothWidth + 0.6) + boothWidth / 2
        : width / 2 - centralAisle / 2 - 1.2 - (perSide - sideColumn) * (boothWidth + 0.6) + boothWidth / 2;
      placeElement(scene, "rect_table", {
        x,
        y: top + row * (boothHeight + 0.9) + boothHeight / 2,
        width: boothWidth,
        height: boothHeight,
        label: `BOOTH ${String(index + 1).padStart(2, "0")}`,
        labelSize: 0.15,
        seats: 2,
      });
      index += 1;
    }
  }

  placeElement(scene, "vip_area", {
    x: width - margin - 2.2,
    y: 5,
    width: 4.4,
    height: 3.2,
    label: "SPEAKER",
    labelSize: 0.2,
    zIndex: 0,
  });
  placeElement(scene, "sofa_set", {
    x: width / 2,
    y: height - 4.6,
    width: 2.2,
    height: 3.2,
    label: "LOUNGE",
    labelSize: 0.16,
  });
}

function addConcert(
  scene: FloorPlanScene,
  options: {
    width: number;
    height: number;
    margin: number;
    guests: number;
    stageTop: number;
    stageWidth: number;
  },
) {
  const { width, height, margin, guests, stageTop, stageWidth } = options;
  placeElement(scene, "stage", {
    x: width / 2,
    y: 1.6 + 3.2,
    width: stageWidth + 1.6,
    height: 3.8,
    label: "MAIN STAGE",
    labelSize: 0.48,
    zIndex: 2,
  });
  placeElement(scene, "lighting", {
    x: width / 2,
    y: 1.2,
    width: Math.min(width - 2, stageWidth + 4),
    label: "LIGHTS",
    labelSize: 0.16,
  });
  placeElement(scene, "carpet", {
    x: width / 2,
    y: (stageTop + height - 3.4) / 2 + 1.4,
    width: width - margin * 2,
    height: Math.max(8, height - stageTop - 5.6),
    label: "STANDING FLOOR",
    labelSize: 0.28,
    zIndex: 0,
  });
  const bars = Math.max(1, Math.min(3, Math.floor(guests / 400)));
  for (let index = 0; index < bars; index += 1) {
    placeElement(scene, "bar", {
      x: width - margin - 2.4,
      y: 9.4 + index * 4.6,
      width: 3.8,
      height: 1.2,
      rotation: 90,
      label: "BAR",
      labelSize: 0.16,
    });
  }
  placeElement(scene, "security", { x: width / 2 - 2.8, y: height - 3.4 });
  placeElement(scene, "medic", { x: width / 2 + 2.8, y: height - 3.4 });
  placeElement(scene, "entrance", {
    x: width / 2,
    y: height - 0.85,
    width: 6.4,
    height: 1.4,
    label: "ENTRANCE",
  });
}

export function generateVariations(brief: DesignBrief): LayoutVariation[] {
  const definitions = [
    {
      name: "Balanced",
      summary: "Equal weight on circulation, sightlines and seated capacity.",
    },
    {
      name: "Social",
      summary: "A larger dance floor and looser clusters for a more atmospheric room.",
    },
    {
      name: "Capacity-first",
      summary: "Tighter spacing and a narrower stage to seat as many guests as possible.",
    },
  ];

  return definitions.map((meta, index) => {
    const scene = buildLayout(brief, index);
    const warnings = getSceneWarnings(scene);
    const stats = getSceneStats(scene);
    const shortfall = Math.max(0, (scene.guestCount ?? 0) - stats.seats);
    const score = clamp(
      Math.round(
        96 -
          warnings.filter((warning) => warning.severity === "high").length * 11 -
          warnings.filter((warning) => warning.severity === "medium").length * 4 -
          shortfall * 0.4 +
          (scene.eventType === "Conference" ? 0 : 0),
      ),
      48,
      98,
    );
    return {
      id: `variation-${index + 1}`,
      name: meta.name,
      summary: meta.summary,
      scene,
      score,
    };
  });
}

/** Re-flows existing tables below the stage; used by the seating assistant. */
export function arrangeTables(scene: FloorPlanScene): FloorPlanScene {
  const tables = Object.values(scene.elements).filter((element) => {
    const definition = resolveDefinition(scene.definitions, element.definitionId);
    return definition?.traits.seats && definition.traits.seats.layout === "ring";
  });
  if (tables.length === 0) return scene;

  const margin = 1.6;
  const top = Math.min(
    ...tables.map((table) => table.y),
    scene.canvas.height * 0.42,
  );
  const area = {
    x: margin,
    y: Math.max(top, scene.canvas.height * 0.34),
    width: scene.canvas.width - margin * 2,
    height: scene.canvas.height - Math.max(top, scene.canvas.height * 0.34) - 2.4,
  };
  const grid = fitTables(area, tables.length, 0);
  const elements = { ...scene.elements };
  tables.forEach((table, index) => {
    const position = grid.positions[index];
    if (!position) return;
    const diameter = Math.min(grid.diameter, table.width);
    elements[table.id] = {
      ...table,
      x: position.x,
      y: position.y,
      width: diameter,
      height: diameter,
    };
  });
  return { ...scene, elements, updatedAt: Date.now() };
}
