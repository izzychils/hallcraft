import { createEmptyScene, placeElement, tableLabel } from "./scene";
import type { FloorPlanScene, FloorPlanTemplate } from "./types";

function makeScene(
  name: string,
  width: number,
  height: number,
  meta: { venueName: string; eventType: string; guests: number; background?: string },
) {
  const scene = createEmptyScene(name, width, height);
  scene.venueName = meta.venueName;
  scene.eventType = meta.eventType;
  scene.guestCount = meta.guests;
  scene.canvas.background = { color: meta.background ?? "#fbf8f1" };
  return scene;
}

function addRoundTables(
  scene: FloorPlanScene,
  columns: number[],
  rows: number[],
  seats = 10,
  diameter = 3,
  startIndex = 0,
) {
  let index = startIndex;
  rows.forEach((y) => {
    columns.forEach((x) => {
      placeElement(scene, "round_table", {
        x,
        y,
        width: diameter,
        height: diameter,
        seats,
        label: tableLabel(index),
      });
      index += 1;
    });
  });
  return index;
}

function awardsScene(): FloorPlanScene {
  const scene = makeScene("Awards night", 22, 30, {
    venueName: "The Foundry",
    eventType: "Corporate",
    guests: 160,
  });

  placeElement(scene, "lighting", { x: 11, y: 1.7, width: 10, label: "LIGHTS" });
  placeElement(scene, "stage", {
    x: 11,
    y: 4.2,
    width: 10,
    height: 3.2,
    label: "AWARDS STAGE",
    labelSize: 0.5,
  });
  placeElement(scene, "screen", { x: 11, y: 2.15, width: 7.4, label: "SCREEN" });
  placeElement(scene, "podium", { x: 15, y: 4.1, rotation: 0 });
  placeElement(scene, "speaker", { x: 5.1, y: 3.4 });
  placeElement(scene, "speaker", { x: 16.9, y: 3.4 });
  placeElement(scene, "dance_floor", {
    x: 11,
    y: 10.9,
    width: 6.4,
    height: 4.6,
    label: "FLOOR",
    labelSize: 0.34,
  });
  placeElement(scene, "walkway", {
    x: 11,
    y: 24.6,
    width: 2.2,
    height: 8,
    label: "AISLE",
    labelRotation: 90,
    labelSize: 0.2,
  });
  placeElement(scene, "bar", { x: 3.4, y: 2.2, width: 4.4, label: "BAR" });
  placeElement(scene, "buffet_station", {
    x: 18.6,
    y: 2.2,
    width: 4.4,
    label: "CATERING",
  });
  placeElement(scene, "entrance", {
    x: 11,
    y: 28.8,
    width: 5,
    height: 1.4,
    label: "ENTRANCE",
  });
  placeElement(scene, "registration_desk", {
    x: 3.7,
    y: 27.6,
    width: 3.4,
    label: "CHECK-IN",
  });
  placeElement(scene, "vip_area", {
    x: 18.8,
    y: 27,
    width: 4.6,
    height: 3.6,
    label: "VIP",
    labelSize: 0.32,
  });
  placeElement(scene, "photobooth", {
    x: 3.6,
    y: 22.8,
    width: 3.2,
    height: 2.6,
    rotation: -9,
    label: "PHOTO",
  });
  placeElement(scene, "security", { x: 7.2, y: 27.9 });
  placeElement(scene, "staff", { x: 14.4, y: 27.9 });

  addRoundTables(scene, [4.1, 7.5, 14.5, 17.9], [16.1, 19.7, 23.3], 10, 3);
  return scene;
}

function weddingScene(): FloorPlanScene {
  const scene = makeScene("Garden wedding", 20, 30, {
    venueName: "The Orangery",
    eventType: "Wedding",
    guests: 120,
    background: "#fbf7ee",
  });

  placeElement(scene, "stage", {
    x: 10,
    y: 4.6,
    width: 6.4,
    height: 2.4,
    label: "ALTAR",
    labelSize: 0.42,
  });
  placeElement(scene, "flowers", { x: 6.2, y: 4.4, width: 1.4, height: 1.4 });
  placeElement(scene, "flowers", { x: 13.8, y: 4.4, width: 1.4, height: 1.4 });
  placeElement(scene, "walkway", {
    x: 10,
    y: 17.4,
    width: 1.8,
    height: 20.4,
    label: "AISLE",
    labelRotation: 90,
    labelSize: 0.2,
  });
  placeElement(scene, "dance_floor", {
    x: 10,
    y: 9.4,
    width: 4.8,
    height: 4.8,
    label: "DANCE",
    labelSize: 0.28,
  });
  placeElement(scene, "entrance", {
    x: 10,
    y: 28.8,
    width: 4.6,
    height: 1.3,
    label: "ARRIVAL",
  });
  placeElement(scene, "bar", {
    x: 3.2,
    y: 12.4,
    width: 3.8,
    height: 1.2,
    rotation: 90,
    label: "BAR",
  });
  placeElement(scene, "buffet_station", {
    x: 16.9,
    y: 13.8,
    width: 4.2,
    height: 1.3,
    rotation: 90,
    label: "SUPPER",
  });
  placeElement(scene, "photobooth", {
    x: 16.6,
    y: 5.2,
    width: 3.2,
    height: 2.5,
    rotation: 6,
    label: "PHOTO",
  });
  placeElement(scene, "long_table", {
    x: 4.1,
    y: 18.1,
    width: 1.2,
    height: 3.2,
    label: "CAKE",
    labelSize: 0.16,
    seats: 2,
  });
  placeElement(scene, "vip_area", {
    x: 16,
    y: 25.8,
    width: 4.4,
    height: 3.4,
    label: "FAMILY",
    labelSize: 0.26,
  });
  placeElement(scene, "plant", { x: 1.4, y: 1.4 });
  placeElement(scene, "plant", { x: 18.6, y: 1.4 });
  placeElement(scene, "plant", { x: 1.4, y: 28.6 });
  placeElement(scene, "plant", { x: 18.6, y: 28.6 });

  addRoundTables(scene, [6.6, 13.4], [16.2, 19.8, 23.4, 27], 10, 2.9);
  return scene;
}

function galaScene(): FloorPlanScene {
  const scene = makeScene("Winter gala", 26, 34, {
    venueName: "Grand Hall",
    eventType: "Gala dinner",
    guests: 200,
    background: "#f9f5ec",
  });

  placeElement(scene, "lighting", { x: 13, y: 1.6, width: 12, label: "LIGHTS" });
  placeElement(scene, "stage", {
    x: 13,
    y: 4.3,
    width: 11,
    height: 3.4,
    label: "MAIN STAGE",
    labelSize: 0.52,
  });
  placeElement(scene, "screen", { x: 13, y: 2.1, width: 8, label: "SCREEN" });
  placeElement(scene, "speaker", { x: 6.2, y: 3.2 });
  placeElement(scene, "speaker", { x: 19.8, y: 3.2 });
  placeElement(scene, "dance_floor", {
    x: 13,
    y: 11.2,
    width: 7,
    height: 5.4,
    label: "DANCE FLOOR",
    labelSize: 0.34,
  });
  placeElement(scene, "walkway", {
    x: 13,
    y: 27.8,
    width: 2.4,
    height: 9.8,
    label: "AISLE",
    labelRotation: 90,
    labelSize: 0.2,
  });
  placeElement(scene, "entrance", {
    x: 13,
    y: 32.8,
    width: 5.4,
    height: 1.4,
    label: "ENTRANCE",
  });
  placeElement(scene, "bar", {
    x: 2.2,
    y: 12.2,
    width: 4.8,
    height: 1.4,
    rotation: 90,
    label: "BAR",
  });
  placeElement(scene, "bar", {
    x: 23.8,
    y: 12.2,
    width: 4.8,
    height: 1.4,
    rotation: 90,
    label: "BAR",
  });
  placeElement(scene, "buffet_station", {
    x: 4.6,
    y: 2.2,
    width: 5,
    label: "CATERING",
  });
  placeElement(scene, "buffet_station", {
    x: 21.4,
    y: 2.2,
    width: 5,
    label: "CATERING",
  });
  placeElement(scene, "registration_desk", {
    x: 4.4,
    y: 31.8,
    width: 3.4,
    label: "CHECK-IN",
  });
  placeElement(scene, "photobooth", {
    x: 22.4,
    y: 30.9,
    width: 3.4,
    height: 2.6,
    rotation: 8,
    label: "PHOTO",
  });
  placeElement(scene, "vip_area", {
    x: 21.6,
    y: 6.6,
    width: 5,
    height: 3.6,
    label: "VIP",
    labelSize: 0.34,
  });

  addRoundTables(
    scene,
    [4.2, 8.7, 17.3, 21.8],
    [17, 20.8, 24.6, 28.4, 31.4],
    10,
    3,
  );
  return scene;
}

function launchScene(): FloorPlanScene {
  const scene = makeScene("Product launch", 24, 26, {
    venueName: "Dock 9",
    eventType: "Product launch",
    guests: 180,
    background: "#f7f4ee",
  });

  placeElement(scene, "stage", {
    x: 12,
    y: 4.4,
    width: 8,
    height: 2.6,
    label: "KEYNOTE",
    labelSize: 0.42,
  });
  placeElement(scene, "screen", {
    x: 12,
    y: 2.1,
    width: 9.5,
    height: 0.3,
    label: "LED WALL",
  });
  placeElement(scene, "carpet", {
    x: 12,
    y: 13.6,
    width: 12,
    height: 8,
    label: "DEMO FLOOR",
    labelSize: 0.26,
  });
  placeElement(scene, "entrance", {
    x: 12,
    y: 24.8,
    width: 5.4,
    height: 1.4,
    label: "ENTRANCE",
  });
  placeElement(scene, "registration_desk", {
    x: 3.4,
    y: 23.4,
    width: 3.4,
    label: "CHECK-IN",
  });
  placeElement(scene, "bar", { x: 19.6, y: 8.9, width: 4.6, height: 1.3, rotation: 90, label: "BAR" });
  placeElement(scene, "bar", { x: 4.4, y: 8.9, width: 4.6, height: 1.3, rotation: 90, label: "BAR" });

  // Demo pods down both sides, with cocktail tables through the middle.
  [7.3, 11.4, 15.5, 19.6].forEach((y, index) => {
    placeElement(scene, "rect_table", {
      x: 3.4,
      y,
      width: 2.4,
      height: 1.3,
      label: `DEMO 0${index + 1}`,
      labelSize: 0.16,
      seats: 2,
    });
    placeElement(scene, "rect_table", {
      x: 20.6,
      y,
      width: 2.4,
      height: 1.3,
      label: `DEMO 0${index + 5}`,
      labelSize: 0.16,
      seats: 2,
    });
  });

  [
    [8.6, 12.4],
    [12, 12.4],
    [15.4, 12.4],
    [8.6, 15.4],
    [12, 15.4],
    [15.4, 15.4],
    [10.3, 18.6],
    [13.7, 18.6],
  ].forEach(([x, y]) => {
    placeElement(scene, "cocktail_table", { x, y, width: 1.1, height: 1.1 });
  });

  placeElement(scene, "sofa_set", {
    x: 20.2,
    y: 21.2,
    width: 2.4,
    height: 3.4,
    rotation: 90,
    label: "LOUNGE",
    labelSize: 0.18,
  });
  placeElement(scene, "sofa_set", {
    x: 3.8,
    y: 20.6,
    width: 2.4,
    height: 3.4,
    rotation: 90,
    label: "LOUNGE",
    labelSize: 0.18,
  });
  return scene;
}

function conferenceScene(): FloorPlanScene {
  const scene = makeScene("Leadership summit", 26, 34, {
    venueName: "Convention Centre",
    eventType: "Conference",
    guests: 280,
  });

  placeElement(scene, "lighting", { x: 13, y: 1.5, width: 13, label: "LIGHTS" });
  placeElement(scene, "stage", {
    x: 13,
    y: 4.1,
    width: 12,
    height: 3.2,
    label: "KEYNOTE STAGE",
    labelSize: 0.5,
  });
  placeElement(scene, "screen", { x: 13, y: 1.95, width: 10, label: "SCREEN" });
  placeElement(scene, "podium", { x: 8.2, y: 4.1 });
  placeElement(scene, "speaker", { x: 5.4, y: 3.2 });
  placeElement(scene, "speaker", { x: 20.6, y: 3.2 });
  placeElement(scene, "walkway", {
    x: 13,
    y: 18.6,
    width: 2,
    height: 4.6,
    label: "AISLE",
    labelRotation: 90,
    labelSize: 0.18,
  });
  placeElement(scene, "registration_desk", {
    x: 4,
    y: 31.8,
    width: 3.8,
    label: "CHECK-IN",
  });
  placeElement(scene, "entrance", {
    x: 13,
    y: 32.8,
    width: 6,
    height: 1.4,
    label: "ENTRANCE",
  });
  placeElement(scene, "cloakroom", { x: 22, y: 31.6, width: 2.6, height: 1.8 });
  placeElement(scene, "bar", { x: 3.2, y: 9.4, width: 4, height: 1.2, rotation: 90, label: "COFFEE" });
  placeElement(scene, "bar", { x: 22.8, y: 9.4, width: 4, height: 1.2, rotation: 90, label: "COFFEE" });

  let table = 1;
  const rows = [9.2, 12.1, 15, 17.9, 20.8, 23.7, 26.6, 29.3];
  rows.forEach((y) => {
    [5.2, 10.1, 15.9, 20.8].forEach((x) => {
      placeElement(scene, "rect_table", {
        x,
        y,
        width: 4.2,
        height: 1.1,
        seats: 10,
        label: `ROW ${table}`,
        labelSize: 0.16,
      });
      table += 1;
    });
  });
  return scene;
}

function exhibitionScene(): FloorPlanScene {
  const scene = makeScene("Design expo", 30, 32, {
    venueName: "Pier Pavilion",
    eventType: "Exhibition",
    guests: 400,
    background: "#f8f5ef",
  });

  placeElement(scene, "stage", {
    x: 15,
    y: 4,
    width: 8,
    height: 2.4,
    label: "TALKS",
    labelSize: 0.4,
  });
  placeElement(scene, "registration_desk", {
    x: 5,
    y: 28.6,
    width: 4.6,
    label: "REGISTRATION",
  });
  placeElement(scene, "entrance", {
    x: 15,
    y: 30.8,
    width: 6,
    height: 1.5,
    label: "MAIN ENTRANCE",
  });
  placeElement(scene, "walkway", {
    x: 15,
    y: 17,
    width: 3,
    height: 22,
    label: "CENTRAL AISLE",
    labelRotation: 90,
    labelSize: 0.22,
  });
  placeElement(scene, "bar", { x: 24.8, y: 4.5, width: 5, height: 1.3, rotation: 90, label: "CAFE" });
  placeElement(scene, "cloakroom", { x: 26.6, y: 28.2, width: 3.4, height: 2 });
  placeElement(scene, "vip_area", {
    x: 4.2,
    y: 5,
    width: 5,
    height: 3.6,
    label: "SPEAKER LOUNGE",
    labelSize: 0.2,
  });

  let booth = 1;
  [8.4, 13.4, 19.6, 24.6].forEach((y) => {
    [5.2, 9.6, 20.4, 24.8].forEach((x) => {
      if (y === 8.4 && x < 10) return;
      placeElement(scene, "rect_table", {
        x,
        y,
        width: 3.6,
        height: 2.4,
        label: `BOOTH ${String(booth).padStart(2, "0")}`,
        labelSize: 0.18,
        seats: 2,
      });
      booth += 1;
    });
  });
  placeElement(scene, "sofa_set", {
    x: 15,
    y: 24.8,
    width: 2.6,
    height: 4,
    label: "LOUNGE",
    labelSize: 0.18,
  });
  return scene;
}

export const FLOOR_PLAN_TEMPLATES: FloorPlanTemplate[] = [
  {
    id: "awards",
    name: "Corporate awards",
    description: "Stage, central dance floor and 12 cabaret tables with a clear arrival aisle.",
    eventType: "Corporate",
    guests: 160,
    width: 22,
    height: 30,
    build: awardsScene,
  },
  {
    id: "wedding",
    name: "Garden wedding",
    description: "Ceremony arch, long aisle, 8 tables and a supper station along the wall.",
    eventType: "Wedding",
    guests: 120,
    width: 20,
    height: 30,
    build: weddingScene,
  },
  {
    id: "gala",
    name: "Winter gala",
    description: "Black-tie dinner for 200 with two bars and a central dance floor.",
    eventType: "Gala dinner",
    guests: 200,
    width: 26,
    height: 34,
    build: galaScene,
  },
  {
    id: "launch",
    name: "Product launch",
    description: "Keynote stage, demo pods and a standing reception with lounge corners.",
    eventType: "Product launch",
    guests: 180,
    width: 24,
    height: 26,
    build: launchScene,
  },
  {
    id: "conference",
    name: "Leadership summit",
    description: "Theatre-style rows for 280, coffee points and a clear central aisle.",
    eventType: "Conference",
    guests: 280,
    width: 26,
    height: 34,
    build: conferenceScene,
  },
  {
    id: "expo",
    name: "Design expo",
    description: "Booth grid around a wide aisle, registration and a speaker lounge.",
    eventType: "Exhibition",
    guests: 400,
    width: 30,
    height: 32,
    build: exhibitionScene,
  },
];

export const TEMPLATE_BY_ID = Object.fromEntries(
  FLOOR_PLAN_TEMPLATES.map((template) => [template.id, template]),
) as Record<string, FloorPlanTemplate>;
