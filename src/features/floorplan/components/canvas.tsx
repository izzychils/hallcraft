"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Maximize2, Sparkles, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ZOOM_LIMITS } from "../constants";
import {
  alignmentSnap,
  clamp,
  clampElementToCanvas,
  elementBounds,
  normalizeRotation,
  roundMetres,
  snapPosition,
  snapToGrid,
} from "../geometry";
import { resolveDefinition } from "../scene";
import { ElementArtwork } from "../render";
import { useFloorPlanStore } from "../store";
import type { FloorPlanElement, FloorPlanGuide } from "../types";

const DND_TYPE = "application/x-hallcraft-definition";
const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;
type Handle = (typeof HANDLES)[number];

interface Point {
  x: number;
  y: number;
}

type Interaction =
  | {
      type: "move";
      start: Point;
      positions: Record<string, Point>;
      primaryId: string;
      moved: boolean;
    }
  | {
      type: "resize";
      handle: Handle;
      start: Point;
      element: FloorPlanElement;
    }
  | {
      type: "rotate";
      element: FloorPlanElement;
    }
  | {
      type: "marquee";
      start: Point;
      additive: boolean;
    }
  | {
      type: "pan";
      client: Point;
      center: Point;
    };

export function FloorPlanCanvas({
  interactive = true,
  className,
  onOpenLibrary,
  onOpenAi,
}: {
  interactive?: boolean;
  className?: string;
  onOpenLibrary?: () => void;
  onOpenAi?: () => void;
}) {
  const scene = useFloorPlanStore((state) => state.scene);
  const selectedIds = useFloorPlanStore((state) => state.selectedIds);
  const tool = useFloorPlanStore((state) => state.tool);
  const snapEnabled = useFloorPlanStore((state) => state.snapEnabled);
  const select = useFloorPlanStore((state) => state.select);
  const toggleSelect = useFloorPlanStore((state) => state.toggleSelect);
  const selectMany = useFloorPlanStore((state) => state.selectMany);
  const clearSelection = useFloorPlanStore((state) => state.clearSelection);
  const moveElements = useFloorPlanStore((state) => state.moveElements);
  const updateElement = useFloorPlanStore((state) => state.updateElement);
  const addElement = useFloorPlanStore((state) => state.addElement);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const interaction = useRef<Interaction | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<Point>({
    x: scene.canvas.width / 2,
    y: scene.canvas.height / 2,
  });
  const [positionPreview, setPositionPreview] = useState<Record<string, Point>>({});
  const [dragElement, setDragElement] = useState<FloorPlanElement | null>(null);
  const [guides, setGuides] = useState<FloorPlanGuide[]>([]);
  const [marquee, setMarquee] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [cursor, setCursor] = useState<string>("default");
  const [editingLabel, setEditingLabel] = useState<{
    id: string;
    text: string;
    left: number;
    top: number;
  } | null>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) setSize({ width: rect.width, height: rect.height });
    });
    observer.observe(node);
    setSize({ width: node.clientWidth, height: node.clientHeight });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setCenter({ x: scene.canvas.width / 2, y: scene.canvas.height / 2 });
  }, [scene.canvas.height, scene.canvas.width]);

  useEffect(() => {
    if (!editingLabel) return;
    const timer = window.setTimeout(() => {
      labelInputRef.current?.focus();
      labelInputRef.current?.select();
    }, 10);
    return () => window.clearTimeout(timer);
  }, [editingLabel]);

  const paddingPx = size.width < 640 ? 18 : 52;
  const baseScale = useMemo(() => {
    if (!size.width || !size.height) return 0;
    return Math.max(
      0.01,
      Math.min(
        (size.width - paddingPx * 2) / scene.canvas.width,
        (size.height - paddingPx * 2) / scene.canvas.height,
      ),
    );
  }, [paddingPx, scene.canvas.height, scene.canvas.width, size.height, size.width]);

  const scale = baseScale * zoom;
  const viewWidth = size.width / (scale || 1);
  const viewHeight = size.height / (scale || 1);
  const unit = viewWidth / Math.max(1, size.width);
  const viewX = center.x - viewWidth / 2;
  const viewY = center.y - viewHeight / 2;

  const toScene = useCallback((clientX: number, clientY: number): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const matrix = svg.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    const transformed = point.matrixTransform(matrix.inverse());
    return { x: transformed.x, y: transformed.y };
  }, []);

  const clampCenter = useCallback(
    (value: Point): Point => ({
      x: clamp(value.x, 0, scene.canvas.width),
      y: clamp(value.y, 0, scene.canvas.height),
    }),
    [scene.canvas.height, scene.canvas.width],
  );

  const applyZoom = useCallback(
    (nextZoom: number, anchor?: Point) => {
      const clamped = clamp(nextZoom, ZOOM_LIMITS.min, ZOOM_LIMITS.max);
      if (Math.abs(clamped - zoom) < 0.001) return;
      if (anchor) {
        const ratio = zoom / clamped;
        const nextCenter = {
          x: anchor.x + (center.x - anchor.x) * ratio,
          y: anchor.y + (center.y - anchor.y) * ratio,
        };
        setCenter(clampCenter(nextCenter));
      }
      setZoom(clamped);
    },
    [center, clampCenter, zoom],
  );

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (!interactive) return;
      event.preventDefault();
      const anchor = toScene(event.clientX, event.clientY);
      const onPlan =
        anchor.x >= 0 &&
        anchor.x <= scene.canvas.width &&
        anchor.y >= 0 &&
        anchor.y <= scene.canvas.height;

      // Over the venue, zoom into the point under the cursor. Over the surround,
      // scroll the plan instead: wheel up/down vertically, horizontal wheel or
      // Shift + wheel left/right, matching the studio reference.
      if (onPlan) {
        const factor = Math.exp(-event.deltaY * 0.0015);
        applyZoom(zoom * factor, anchor);
        return;
      }

      const panX = event.deltaX + (event.shiftKey ? event.deltaY : 0);
      const panY = event.shiftKey ? 0 : event.deltaY;
      if (!panX && !panY) return;
      const currentScale = scale || 1;
      // Wheel down/right scrolls the drawing up/left, the same direction as
      // the reference studio's surround scrolling.
      setCenter(
        clampCenter({
          x: center.x + panX / currentScale,
          y: center.y + panY / currentScale,
        }),
      );
    },
    [
      applyZoom,
      center,
      clampCenter,
      interactive,
      scale,
      scene.canvas.height,
      scene.canvas.width,
      toScene,
      zoom,
    ],
  );

  // React attaches wheel listeners passively, which makes preventDefault a no-op
  // and logs a console error. Bind the zoom handler natively instead.
  useEffect(() => {
    const node = svgRef.current;
    if (!node) return;
    const listener = (event: WheelEvent) => handleWheel(event);
    node.addEventListener("wheel", listener, { passive: false });
    return () => node.removeEventListener("wheel", listener);
  }, [handleWheel, size.height, size.width]);

  const commitTransform = (element: FloorPlanElement) => {
    updateElement(element.id, {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: element.rotation,
    });
  };

  const beginResize = (event: ReactPointerEvent<SVGGElement>, handle: Handle) => {
    if (!interactive) return;
    event.stopPropagation();
    const element = selectedIds.length === 1 ? scene.elements[selectedIds[0]] : null;
    if (!element || element.locked) return;
    svgRef.current?.setPointerCapture(event.pointerId);
    interaction.current = {
      type: "resize",
      handle,
      start: toScene(event.clientX, event.clientY),
      element: { ...element },
    };
    setCursor("nwse-resize");
  };

  const beginRotate = (event: ReactPointerEvent<SVGGElement>) => {
    if (!interactive) return;
    event.stopPropagation();
    const element = selectedIds.length === 1 ? scene.elements[selectedIds[0]] : null;
    if (!element || element.locked) return;
    svgRef.current?.setPointerCapture(event.pointerId);
    interaction.current = { type: "rotate", element: { ...element } };
    setCursor("grabbing");
  };

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!interactive) return;
    if (event.button === 2) return;
    const target = event.target as Element;
    if (target.closest("[data-interactive-handle]")) return;

    const point = toScene(event.clientX, event.clientY);
    svgRef.current?.setPointerCapture(event.pointerId);

    if (tool === "pan" || event.button === 1) {
      interaction.current = {
        type: "pan",
        client: { x: event.clientX, y: event.clientY },
        center: { ...center },
      };
      setCursor("grabbing");
      return;
    }

    if (!event.shiftKey) clearSelection();
    setEditingLabel(null);
    interaction.current = {
      type: "marquee",
      start: point,
      additive: event.shiftKey,
    };
    setMarquee({ x: point.x, y: point.y, width: 0, height: 0 });
    setCursor("crosshair");
  };

  const handleElementPointerDown = (
    event: ReactPointerEvent<SVGGElement>,
    element: FloorPlanElement,
  ) => {
    if (!interactive) return;
    if (event.button !== 0 || tool !== "select") return;
    event.stopPropagation();
    const additive = event.shiftKey || event.metaKey || event.ctrlKey;
    if (additive) {
      toggleSelect(element.id);
      return;
    }
    const ids = selectedIds.includes(element.id) ? selectedIds : [element.id];
    if (!selectedIds.includes(element.id)) select(element.id);
    if (element.locked || tool !== "select") return;

    const positions: Record<string, Point> = {};
    ids.forEach((id) => {
      const item = scene.elements[id];
      if (item && !item.locked) positions[id] = { x: item.x, y: item.y };
    });
    svgRef.current?.setPointerCapture(event.pointerId);
    interaction.current = {
      type: "move",
      start: toScene(event.clientX, event.clientY),
      positions,
      primaryId: element.id,
      moved: false,
    };
    setCursor("grabbing");
    setEditingLabel(null);
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const current = interaction.current;
    if (!current) return;
    const point = toScene(event.clientX, event.clientY);

    if (current.type === "pan") {
      const scaleNow = baseScale * zoom || 1;
      setCenter(
        clampCenter({
          x: current.center.x - (event.clientX - current.client.x) / scaleNow,
          y: current.center.y - (event.clientY - current.client.y) / scaleNow,
        }),
      );
      return;
    }

    if (current.type === "marquee") {
      const additive = current.additive;
      const next = {
        x: Math.min(current.start.x, point.x),
        y: Math.min(current.start.y, point.y),
        width: Math.abs(point.x - current.start.x),
        height: Math.abs(point.y - current.start.y),
      };
      setMarquee(next);
      if (!additive) {
        // Selection commits on release, like the reference editor.
      }
      return;
    }

    if (current.type === "move") {
      const primaryStart = current.positions[current.primaryId];
      if (!primaryStart) return;
      const dx = point.x - current.start.x;
      const dy = point.y - current.start.y;
      if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) return;
      const primary = scene.elements[current.primaryId];
      if (!primary) return;

      const rawX = primaryStart.x + dx;
      const rawY = primaryStart.y + dy;
      const snapped = snapPosition(rawX, rawY, primary, scene, snapEnabled && !event.altKey);
      const aligned = snapEnabled && !event.altKey
        ? alignmentSnap(snapped.x, snapped.y, primary, scene, (9 * unit) / 1)
        : { x: snapped.x, y: snapped.y, guides: [] as FloorPlanGuide[] };
      const appliedDx = aligned.x - primaryStart.x;
      const appliedDy = aligned.y - primaryStart.y;
      const preview: Record<string, Point> = {};
      Object.entries(current.positions).forEach(([id, position]) => {
        preview[id] = {
          x: roundMetres(position.x + appliedDx),
          y: roundMetres(position.y + appliedDy),
        };
      });
      setPositionPreview(preview);
      setGuides(aligned.guides);
      current.moved = true;
      return;
    }

    if (current.type === "resize") {
      const element = current.element;
      const definition = resolveDefinition(scene.definitions, element.definitionId);
      const lockAspect = Boolean(definition?.traits.lockAspect);
      const rotation = (element.rotation * Math.PI) / 180;
      const dx = point.x - current.start.x;
      const dy = point.y - current.start.y;
      const localDx = dx * Math.cos(rotation) + dy * Math.sin(rotation);
      const localDy = -dx * Math.sin(rotation) + dy * Math.cos(rotation);

      const handle = current.handle;
      const movesX = handle.includes("e") || handle.includes("w");
      const movesY = handle.includes("n") || handle.includes("s");
      const signX = handle.includes("e") ? 1 : -1;
      const signY = handle.includes("s") ? 1 : -1;

      let width = movesX ? element.width + localDx * signX : element.width;
      let height = movesY ? element.height + localDy * signY : element.height;
      const keepRatio = (lockAspect || event.shiftKey) && movesX && movesY;
      if (keepRatio) {
        const ratio = element.width / element.height;
        if (Math.abs(width) * (1 / ratio) >= Math.abs(height)) {
          height = width / ratio;
        } else {
          width = height * ratio;
        }
      }
      const grid = scene.canvas.grid;
      const snapSize = (value: number) =>
        snapEnabled && !event.altKey
          ? Math.max(grid, snapToGrid(Math.max(0.3, value), grid))
          : roundMetres(Math.max(0.3, value));
      width = snapSize(width);
      height = snapSize(height);

      const localShiftX = movesX ? (width - element.width) * signX * 0.5 : 0;
      const localShiftY = movesY ? (height - element.height) * signY * 0.5 : 0;
      const globalShiftX = localShiftX * Math.cos(rotation) - localShiftY * Math.sin(rotation);
      const globalShiftY = localShiftX * Math.sin(rotation) + localShiftY * Math.cos(rotation);

      const next = clampElementToCanvas(
        {
          ...element,
          width,
          height,
          x: element.x + globalShiftX,
          y: element.y + globalShiftY,
        },
        scene.canvas,
      );
      setDragElement(next);
      useFloorPlanStore.getState().setLiveTransform({
        id: next.id,
        x: next.x,
        y: next.y,
        width: next.width,
        height: next.height,
        rotation: next.rotation,
      });
      return;
    }

    if (current.type === "rotate") {
      const element = current.element;
      const angle = (Math.atan2(point.y - element.y, point.x - element.x) * 180) / Math.PI;
      let nextRotation = normalizeRotation(angle + 90);
      if (event.shiftKey) nextRotation = Math.round(nextRotation / 15) * 15;
      const next = { ...element, rotation: normalizeRotation(nextRotation) };
      setDragElement(next);
      useFloorPlanStore.getState().setLiveTransform({
        id: next.id,
        x: next.x,
        y: next.y,
        width: next.width,
        height: next.height,
        rotation: next.rotation,
      });
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    const current = interaction.current;
    interaction.current = null;
    setCursor("default");
    setGuides([]);
    svgRef.current?.releasePointerCapture?.(event.pointerId);

    if (!current) return;

    if (current.type === "move") {
      if (current.moved) {
        moveElements(
          Object.entries(positionPreview).map(([id, value]) => ({
            id,
            x: value.x,
            y: value.y,
          })),
        );
      }
      setPositionPreview({});
      return;
    }

    if (current.type === "resize" || current.type === "rotate") {
      if (dragElement) commitTransform(dragElement);
      setDragElement(null);
      useFloorPlanStore.getState().setLiveTransform(null);
      return;
    }

    if (current.type === "marquee") {
      const box = marquee;
      setMarquee(null);
      if (!box || box.width < 0.2 || box.height < 0.2) return;
      const left = box.x;
      const top = box.y;
      const right = box.x + box.width;
      const bottom = box.y + box.height;
      const inside = Object.values(scene.elements)
        .filter((element) => {
          const bounds = elementBounds(element);
          return (
            bounds.left >= left &&
            bounds.right <= right &&
            bounds.top >= top &&
            bounds.bottom <= bottom
          );
        })
        .map((element) => element.id);
      if (current.additive) {
        selectMany(Array.from(new Set([...selectedIds, ...inside])));
      } else {
        selectMany(inside);
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!interactive) return;
    const definitionId = event.dataTransfer.getData(DND_TYPE);
    if (!definitionId) return;
    const point = toScene(event.clientX, event.clientY);
    addElement(definitionId, point);
  };

  const openLabelEditor = (
    event: React.MouseEvent<SVGGElement>,
    element: FloorPlanElement,
  ) => {
    if (!interactive || element.locked) return;
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const container = containerRef.current?.getBoundingClientRect();
    if (!container) return;
    select(element.id);
    setEditingLabel({
      id: element.id,
      text: element.label.text,
      left: rect.left - container.left + rect.width / 2,
      top: rect.top - container.top + rect.height / 2,
    });
  };

  const commitLabel = () => {
    if (!editingLabel) return;
    const element = scene.elements[editingLabel.id];
    const text = editingLabel.text.slice(0, 80);
    if (element && element.label.text !== text) {
      updateElement(element.id, { label: { text, visible: true } });
    }
    setEditingLabel(null);
  };

  const elements = useMemo(
    () => Object.values(scene.elements).sort((a, b) => a.zIndex - b.zIndex),
    [scene.elements],
  );

  const primary =
    selectedIds.length === 1 ? scene.elements[selectedIds[0]] ?? null : null;
  const displayPrimary = primary
    ? dragElement?.id === primary.id
      ? dragElement
      : {
          ...primary,
          ...(positionPreview[primary.id] ?? {}),
        }
    : null;

  const handlePositions = displayPrimary
    ? (() => {
        const halfW = displayPrimary.width / 2;
        const halfH = displayPrimary.height / 2;
        const points: Record<Handle, Point> = {
          nw: { x: -halfW, y: -halfH },
          n: { x: 0, y: -halfH },
          ne: { x: halfW, y: -halfH },
          e: { x: halfW, y: 0 },
          se: { x: halfW, y: halfH },
          s: { x: 0, y: halfH },
          sw: { x: -halfW, y: halfH },
          w: { x: -halfW, y: 0 },
        };
        const radians = (displayPrimary.rotation * Math.PI) / 180;
        return Object.fromEntries(
          Object.entries(points).map(([key, value]) => [
            key,
            {
              x:
                displayPrimary.x +
                value.x * Math.cos(radians) -
                value.y * Math.sin(radians),
              y:
                displayPrimary.y +
                value.x * Math.sin(radians) +
                value.y * Math.cos(radians),
            },
          ]),
        ) as Record<Handle, Point>;
      })()
    : null;

  const rotateHandle = displayPrimary
    ? (() => {
        const radians = (displayPrimary.rotation * Math.PI) / 180;
        const offset = displayPrimary.height / 2 + 28 * unit;
        return {
          x: displayPrimary.x + offset * Math.sin(radians),
          y: displayPrimary.y - offset * Math.cos(radians),
        };
      })()
    : null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full overflow-hidden bg-[#e9e3d7]",
        className,
      )}
      style={{
        touchAction: "none",
        cursor: interactive ? cursor : "default",
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(58,53,45,0.16) 1px, transparent 0)",
        backgroundSize: "22px 22px",
      }}
      onDragOver={(event) => {
        if (interactive) event.preventDefault();
      }}
      onDrop={handleDrop}
      onContextMenu={(event) => event.preventDefault()}
    >
      {size.width > 0 && size.height > 0 ? (
        <svg
          ref={svgRef}
          width={size.width}
          height={size.height}
          viewBox={`${viewX} ${viewY} ${viewWidth} ${viewHeight}`}
          className="block h-full w-full select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <defs>
            <filter id="hallcraft-room-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0.35" stdDeviation="0.45" floodColor="#2b2419" floodOpacity="0.22" />
            </filter>
            <pattern id="event-floor-hatch" width="0.6" height="0.6" patternUnits="userSpaceOnUse">
              <path d="M0 0.6 0.6 0" stroke="#3a352d" strokeWidth="0.02" opacity="0.08" />
            </pattern>
          </defs>

          <g filter="url(#hallcraft-room-shadow)">
            <rect
              x={0}
              y={0}
              width={scene.canvas.width}
              height={scene.canvas.height}
              fill={scene.canvas.background.color}
              rx={0.06}
            />
          </g>

          <RoomTechnicalLayer scene={scene} unit={unit} />

          {elements.map((element) => {
            const previewPosition = positionPreview[element.id];
            const display = previewPosition
              ? { ...element, x: previewPosition.x, y: previewPosition.y }
              : element;
            const isSelected = selectedIds.includes(element.id);
            return (
              <g
                key={element.id}
                data-element-id={element.id}
                onPointerDown={(event) => handleElementPointerDown(event, element)}
                onDoubleClick={(event) => openLabelEditor(event, element)}
                style={{ cursor: element.locked || tool === "pan" ? "default" : "move" }}
              >
                <ElementArtwork scene={scene} element={display} />
                {isSelected && selectedIds.length > 1 ? (
                  <g
                    transform={`translate(${display.x} ${display.y}) rotate(${display.rotation})`}
                    pointerEvents="none"
                  >
                    <rect
                      x={-display.width / 2}
                      y={-display.height / 2}
                      width={display.width}
                      height={display.height}
                      fill="none"
                      stroke="#171510"
                      strokeWidth={1.4 * unit}
                      strokeDasharray={`${5 * unit} ${3 * unit}`}
                    />
                  </g>
                ) : null}
              </g>
            );
          })}

          {interactive && displayPrimary && handlePositions && rotateHandle ? (
            <SelectionOverlay
              element={displayPrimary}
              handles={handlePositions}
              rotateHandle={rotateHandle}
              unit={unit}
              cornerOnly={Boolean(
                resolveDefinition(scene.definitions, displayPrimary.definitionId)?.traits
                  .lockAspect,
              )}
              onResizeStart={beginResize}
              onRotateStart={beginRotate}
            />
          ) : null}

          {guides.map((guide, index) =>
            guide.axis === "x" ? (
              <line
                key={`guide-x-${index}`}
                x1={guide.at}
                y1={0}
                x2={guide.at}
                y2={scene.canvas.height}
                stroke="#b54a30"
                strokeWidth={unit}
                strokeDasharray={`${4 * unit} ${4 * unit}`}
                pointerEvents="none"
              />
            ) : (
              <line
                key={`guide-y-${index}`}
                x1={0}
                y1={guide.at}
                x2={scene.canvas.width}
                y2={guide.at}
                stroke="#b54a30"
                strokeWidth={unit}
                strokeDasharray={`${4 * unit} ${4 * unit}`}
                pointerEvents="none"
              />
            ),
          )}

          {marquee ? (
            <rect
              x={marquee.x}
              y={marquee.y}
              width={marquee.width}
              height={marquee.height}
              fill="#171510"
              fillOpacity={0.06}
              stroke="#171510"
              strokeWidth={unit}
              strokeDasharray={`${4 * unit} ${3 * unit}`}
              pointerEvents="none"
            />
          ) : null}
        </svg>
      ) : null}

      {elements.length === 0 && interactive ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center p-4">
          <div className="pointer-events-auto w-full max-w-[330px] rounded-xl border border-[#ded7c8] bg-[#fbf8f1]/95 p-4 text-center shadow-paper backdrop-blur">
            <span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-[#e8f5a9]">
              <Sparkles className="h-4 w-4 text-[#3d4a17]" />
            </span>
            <p className="mt-2.5 text-[13px] font-semibold">Start shaping the room</p>
            <p className="mt-1 text-[11px] leading-4 text-[#7c7568]">
              Drag a stage, table or zone in from the library, or let the planner sketch a first
              pass.
            </p>
            <div className="mt-3 flex justify-center gap-2">
              <button
                type="button"
                onClick={onOpenLibrary}
                className="rounded-md border border-[#d4ccbc] px-2.5 py-1.5 text-[11px] font-medium hover:bg-[#f0ebdf]"
              >
                Browse items
              </button>
              <button
                type="button"
                onClick={onOpenAi}
                className="rounded-md bg-[#111111] px-2.5 py-1.5 text-[11px] font-medium text-[#fbf8f1] hover:bg-[#2a2a2a]"
              >
                Draft with AI
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {interactive ? (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap items-end justify-between gap-2">
          <span className="pointer-events-auto inline-flex items-center gap-1.5 rounded-md bg-[#fbf8f1]/90 px-2 py-1 text-[10px] text-[#6f695e] shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7d9a68]" />
            {scene.canvas.width} × {scene.canvas.height} m · {selectedIds.length > 0
              ? `${selectedIds.length} selected`
              : `${elements.length} objects`}
          </span>
          <div className="pointer-events-auto flex items-center gap-0.5 rounded-lg border border-[#d8d1c3] bg-[#fbf8f1]/95 p-0.5 shadow-sm backdrop-blur">
            <ZoomButton
              label="Zoom out"
              onClick={() => applyZoom(zoom / 1.15)}
              disabled={zoom <= ZOOM_LIMITS.min}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </ZoomButton>
            <span className="min-w-[38px] text-center text-[10px] font-medium tabular-nums text-[#4d483e]">
              {Math.round(zoom * 100)}%
            </span>
            <ZoomButton
              label="Zoom in"
              onClick={() => applyZoom(zoom * 1.15)}
              disabled={zoom >= ZOOM_LIMITS.max}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </ZoomButton>
            <span className="mx-0.5 h-4 w-px bg-[#e2dccd]" />
            <ZoomButton
              label="Fit plan to screen"
              onClick={() => {
                setZoom(1);
                setCenter({
                  x: scene.canvas.width / 2,
                  y: scene.canvas.height / 2,
                });
              }}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </ZoomButton>
          </div>
        </div>
      ) : null}

      {editingLabel ? (
        <input
          ref={labelInputRef}
          value={editingLabel.text}
          maxLength={80}
          onChange={(event) =>
            setEditingLabel((current) =>
              current ? { ...current, text: event.target.value } : current,
            )
          }
          onBlur={commitLabel}
          onPointerDown={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitLabel();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              setEditingLabel(null);
            }
          }}
          aria-label="Edit item label"
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded border border-[#171510] bg-[#fffdf8] px-2 py-1 text-center text-[12px] text-[#171510] shadow-sm outline-none"
          style={{ left: editingLabel.left, top: editingLabel.top, width: 168 }}
        />
      ) : null}
    </div>
  );
}

function ZoomButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid h-6 w-6 place-items-center rounded text-[#5d574c] transition-colors hover:bg-[#ede8dc] disabled:opacity-35"
    >
      {children}
    </button>
  );
}

function SelectionOverlay({
  element,
  handles,
  rotateHandle,
  unit,
  cornerOnly,
  onResizeStart,
  onRotateStart,
}: {
  element: FloorPlanElement;
  handles: Record<Handle, Point>;
  rotateHandle: Point;
  unit: number;
  cornerOnly: boolean;
  onResizeStart: (event: ReactPointerEvent<SVGGElement>, handle: Handle) => void;
  onRotateStart: (event: ReactPointerEvent<SVGGElement>) => void;
}) {
  const cursorFor = (handle: Handle) => {
    if (handle === "n" || handle === "s") return "ns-resize";
    if (handle === "e" || handle === "w") return "ew-resize";
    if (handle === "nw" || handle === "se") return "nwse-resize";
    return "nesw-resize";
  };
  const size = 9 * unit;

  return (
    <g>
      <g
        transform={`translate(${element.x} ${element.y}) rotate(${element.rotation})`}
        pointerEvents="none"
      >
        <rect
          x={-element.width / 2}
          y={-element.height / 2}
          width={element.width}
          height={element.height}
          fill="none"
          stroke="#171510"
          strokeWidth={1.4 * unit}
          strokeDasharray={`${5 * unit} ${3 * unit}`}
        />
      </g>

      <line
        x1={element.x}
        y1={element.y}
        x2={rotateHandle.x}
        y2={rotateHandle.y}
        stroke="#171510"
        strokeWidth={unit}
        pointerEvents="none"
      />
      <g
        data-interactive-handle
        transform={`translate(${rotateHandle.x} ${rotateHandle.y})`}
        onPointerDown={onRotateStart}
        style={{ cursor: "grab" }}
      >
        <circle r={13 * unit} fill="transparent" />
        <circle r={6 * unit} fill="#fffdf8" stroke="#171510" strokeWidth={1.3 * unit} />
        <path
          d={`M ${-2.6 * unit} 0 A ${2.6 * unit} ${2.6 * unit} 0 1 1 ${
            2.6 * unit
          } 0`}
          fill="none"
          stroke="#171510"
          strokeWidth={unit}
        />
      </g>

      {HANDLES.filter((handle) =>
        cornerOnly ? handle.length === 2 : true,
      ).map((handle) => (
        <g
          key={handle}
          data-interactive-handle
          transform={`translate(${handles[handle].x} ${handles[handle].y}) rotate(${-element.rotation})`}
          onPointerDown={(event) => onResizeStart(event, handle)}
          style={{ cursor: cursorFor(handle) }}
        >
          <rect
            x={-size}
            y={-size}
            width={size * 2}
            height={size * 2}
            fill="transparent"
          />
          <rect
            x={-size / 2}
            y={-size / 2}
            width={size}
            height={size}
            rx={1.2 * unit}
            fill="#fffdf8"
            stroke="#171510"
            strokeWidth={1.2 * unit}
          />
        </g>
      ))}
    </g>
  );
}

function RoomTechnicalLayer({
  scene,
  unit,
}: {
  scene: ReturnType<typeof useFloorPlanStore.getState>["scene"];
  unit: number;
}) {
  const step = scene.canvas.grid;
  const majorEvery = 4;
  return (
    <g pointerEvents="none">
      {Array.from({ length: Math.floor(scene.canvas.width / step) + 1 }).map((_, index) => (
        <line
          key={`grid-x-${index}`}
          x1={index * step}
          y1={0}
          x2={index * step}
          y2={scene.canvas.height}
          stroke="#3a352d"
          strokeWidth={index % majorEvery === 0 ? 0.02 : 0.01}
          opacity={index % majorEvery === 0 ? 0.13 : 0.055}
        />
      ))}
      {Array.from({ length: Math.floor(scene.canvas.height / step) + 1 }).map((_, index) => (
        <line
          key={`grid-y-${index}`}
          x1={0}
          y1={index * step}
          x2={scene.canvas.width}
          y2={index * step}
          stroke="#3a352d"
          strokeWidth={index % majorEvery === 0 ? 0.02 : 0.01}
          opacity={index % majorEvery === 0 ? 0.13 : 0.055}
        />
      ))}
      <rect
        x={0}
        y={0}
        width={scene.canvas.width}
        height={scene.canvas.height}
        fill="none"
        stroke="#5b5347"
        strokeWidth={0.07}
        opacity={0.45}
      />
      <g opacity={0.42}>
        <line
          x1={0}
          y1={scene.canvas.height + 0.7 * Math.max(1, unit * 20)}
          x2={scene.canvas.width}
          y2={scene.canvas.height + 0.7 * Math.max(1, unit * 20)}
          stroke="#5b5347"
          strokeWidth={Math.max(0.02, unit)}
        />
        <line
          x1={0}
          y1={scene.canvas.height + 0.35}
          x2={0}
          y2={scene.canvas.height + 1.05}
          stroke="#5b5347"
          strokeWidth={Math.max(0.02, unit)}
        />
        <line
          x1={scene.canvas.width}
          y1={scene.canvas.height + 0.35}
          x2={scene.canvas.width}
          y2={scene.canvas.height + 1.05}
          stroke="#5b5347"
          strokeWidth={Math.max(0.02, unit)}
        />
        <text
          x={scene.canvas.width / 2}
          y={scene.canvas.height + 1.55}
          textAnchor="middle"
          fontSize={Math.max(0.3, unit * 22)}
          fill="#5b5347"
          fontFamily="Inter, Helvetica Neue, Arial, sans-serif"
        >
          {scene.canvas.width.toFixed(1)} m
        </text>
      </g>
    </g>
  );
}
