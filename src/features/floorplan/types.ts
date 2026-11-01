/**
 * Floor plan model.
 *
 * All distances are decimal metres. An element's x/y is its CENTRE, which
 * keeps rotation, seating rings and resize handles symmetrical.
 */

export type FloorPlanCategory =
  | "Venue"
  | "Structures"
  | "Seating"
  | "Lounge"
  | "Zones"
  | "Facilities"
  | "Equipment"
  | "Decor"
  | "Markers";

export type FloorPlanShape = "rect" | "circle" | "triangle";

export type SeatLayout = "ring" | "sides" | "row" | "single";

export interface SeatTrait {
  layout: SeatLayout;
  min: number;
  max: number;
  default: number;
  /** Chairs per long edge when the layout is "sides". */
  sides?: number;
}

export interface FloorPlanTraits {
  seats?: SeatTrait;
  zone?: boolean;
  container?: boolean;
  marker?: boolean;
  lockAspect?: boolean;
  entrance?: boolean;
  resizable?: boolean;
  rotatable?: boolean;
}

export interface FloorPlanStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
}

export interface FloorPlanLabel {
  text: string;
  /** Label size in metres, so it scales with the drawing. */
  size: number;
  rotation: number;
  visible: boolean;
}

export interface FloorPlanElementProps {
  seats?: number;
  name?: string;
  note?: string;
  [key: string]: unknown;
}

export interface FloorPlanDefinition {
  id: string;
  name: string;
  category: FloorPlanCategory;
  shape: FloorPlanShape;
  /** Lucide icon name; resolved by the library icon map. */
  icon: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultLabel?: string;
  labelSize?: number;
  cornerRadius?: number;
  traits: FloorPlanTraits;
  defaultStyle: FloorPlanStyle;
  /** Only present on items saved to the workspace library. */
  custom?: boolean;
}

export interface FloorPlanElement {
  id: string;
  definitionId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Clockwise degrees. */
  rotation: number;
  zIndex: number;
  locked: boolean;
  shape?: FloorPlanShape;
  style: FloorPlanStyle;
  label: FloorPlanLabel;
  props: FloorPlanElementProps;
}

export interface FloorPlanCanvasSettings {
  width: number;
  height: number;
  grid: number;
  background: { color: string };
}

export interface FloorPlanScene {
  schema: 1;
  unit: "m";
  name: string;
  venueName?: string;
  eventType?: string;
  guestCount?: number;
  canvas: FloorPlanCanvasSettings;
  elements: Record<string, FloorPlanElement>;
  /** Snapshot of custom definitions so the design stays portable. */
  definitions: Record<string, FloorPlanDefinition>;
  version: number;
  updatedAt: number;
}

export interface FloorPlanStats {
  elements: number;
  tables: number;
  seats: number;
  zones: number;
  width: number;
  height: number;
  capacity: number;
}

export interface SeatPosition {
  x: number;
  y: number;
  rotation: number;
}

export type WarningKind = "overlap" | "blocked-exit" | "capacity" | "clearance" | "outside";

export interface FloorPlanWarning {
  kind: WarningKind;
  severity: "high" | "medium" | "low";
  message: string;
  elementIds: string[];
}

export interface FloorPlanGuide {
  axis: "x" | "y";
  at: number;
}

export interface FloorPlanTemplate {
  id: string;
  name: string;
  description: string;
  eventType: string;
  guests: number;
  width: number;
  height: number;
  build: () => FloorPlanScene;
}

export interface DesignBrief {
  brief: string;
  eventType: string;
  guests: number;
  width: number;
  height: number;
  style: string;
}

export interface LayoutVariation {
  id: string;
  name: string;
  summary: string;
  scene: FloorPlanScene;
  score: number;
}
