import { memo } from "react";
import { cn } from "@/lib/utils";
import { resolveDefinition } from "./scene";
import { seatPositions } from "./geometry";
import type { FloorPlanElement, FloorPlanScene } from "./types";

interface ElementArtworkProps {
  scene: FloorPlanScene;
  element: FloorPlanElement;
  /** Preview mode hides small annotation labels and lightens the grid work. */
  preview?: boolean;
  muted?: boolean;
}

const chairSize = 0.44;

export const ElementArtwork = memo(function ElementArtwork({
  scene,
  element,
  preview = false,
  muted = false,
}: ElementArtworkProps) {
  const definition = resolveDefinition(scene.definitions, element.definitionId);
  if (!definition) return null;

  const shape = element.shape ?? definition.shape;
  const shapeProps = {
    fill: element.style.fill,
    stroke: element.style.stroke,
    strokeWidth: element.style.strokeWidth,
    opacity: muted ? 0.6 : element.style.opacity,
    vectorEffect: "non-scaling-stroke" as const,
  };
  const marker = definition.traits.marker === true;
  const zone = definition.traits.zone === true;
  const halfW = element.width / 2;
  const halfH = element.height / 2;
  const labelSize = element.label.size;
  const labelOffsetY = marker ? halfH + labelSize * 1.5 + 0.16 : 0;
  const labelLines = splitLabel(element.label.text, definition.traits.marker ? 12 : 22);
  const showLabel = element.label.visible && element.label.text.trim().length > 0;

  const seats = seatPositions(element, scene);

  return (
    <g
      transform={`translate(${element.x} ${element.y}) rotate(${element.rotation})`}
      opacity={element.locked ? 0.88 : 1}
    >
      {shape === "circle" ? (
        <ellipse cx={0} cy={0} rx={halfW} ry={halfH} {...shapeProps} />
      ) : shape === "triangle" ? (
        <polygon
          points={`0,${-halfH} ${halfW},${halfH} ${-halfW},${halfH}`}
          {...shapeProps}
        />
      ) : (
        <rect
          x={-halfW}
          y={-halfH}
          width={element.width}
          height={element.height}
          rx={Math.min(definition.cornerRadius ?? 0.04, halfW * 0.35)}
          {...shapeProps}
        />
      )}

      {/* The front edge of a stage and the dashed inner line give containers
          the technical-drawing read of the reference plans. */}
      {definition.traits.container && shape === "rect" ? (
        <>
          <line
            x1={-halfW + 0.12}
            y1={halfH - 0.12}
            x2={halfW - 0.12}
            y2={halfH - 0.12}
            stroke={element.style.stroke}
            strokeWidth={Math.max(element.style.strokeWidth * 2, 0.06)}
            opacity={0.5}
          />
          <rect
            x={-halfW + 0.18}
            y={-halfH + 0.18}
            width={Math.max(0.1, element.width - 0.36)}
            height={Math.max(0.1, element.height - 0.36)}
            fill="none"
            stroke={element.style.stroke}
            strokeWidth={0.025}
            strokeDasharray="0.16 0.12"
            opacity={0.28}
          />
        </>
      ) : null}

      {definition.traits.seats && shape === "circle" && !marker ? (
        <circle
          cx={0}
          cy={0}
          r={Math.max(0.1, halfW * 0.66)}
          fill="none"
          stroke={element.style.stroke}
          strokeWidth={0.018}
          opacity={0.16}
        />
      ) : null}

      {zone ? (
        <rect
          x={-halfW + 0.1}
          y={-halfH + 0.1}
          width={Math.max(0.1, element.width - 0.2)}
          height={Math.max(0.1, element.height - 0.2)}
          rx={0.05}
          fill="none"
          stroke={element.style.stroke}
          strokeWidth={0.018}
          strokeDasharray="0.2 0.16"
          opacity={0.28}
        />
      ) : null}

      {seats.map((seat, index) => (
        <g
          key={`${element.id}-seat-${index}`}
          transform={`translate(${seat.x - element.x} ${seat.y - element.y}) rotate(${
            seat.rotation - element.rotation
          })`}
        >
          <rect
            x={-chairSize / 2}
            y={-chairSize / 2}
            width={chairSize}
            height={chairSize}
            rx={0.1}
            fill={element.style.fill}
            stroke={element.style.stroke}
            strokeWidth={0.022}
            opacity={0.85}
          />
          <line
            x1={-chairSize / 2}
            y1={-chairSize / 2 + 0.06}
            x2={chairSize / 2}
            y2={-chairSize / 2 + 0.06}
            stroke={element.style.stroke}
            strokeWidth={0.03}
            opacity={0.55}
          />
        </g>
      ))}

      {showLabel ? (
        <g
          transform={`translate(0 ${labelOffsetY}) rotate(${element.label.rotation})`}
          pointerEvents="none"
        >
          {labelLines.map((line, index) => (
            <text
              key={index}
              x={0}
              y={(index - (labelLines.length - 1) / 2) * labelSize * 1.2}
              textAnchor="middle"
              dominantBaseline="central"
              fill={marker ? "#fffaf2" : element.style.stroke}
              fontSize={labelSize}
              fontFamily="Inter, Helvetica Neue, Arial, sans-serif"
              fontWeight={marker ? 600 : 500}
              letterSpacing={labelSize * 0.04}
              opacity={preview ? 0.92 : 1}
            >
              {line}
            </text>
          ))}
          {marker && preview ? null : null}
        </g>
      ) : null}
    </g>
  );
});

function splitLabel(text: string, maxChars: number) {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return [trimmed];
  const words = trimmed.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    if ((current + " " + word).trim().length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  });
  if (current) lines.push(current);
  return lines.slice(0, 2);
}

export function RoomGrid({
  scene,
  showGrid = true,
  preview = false,
}: {
  scene: FloorPlanScene;
  showGrid?: boolean;
  preview?: boolean;
}) {
  const step = scene.canvas.grid;
  const horizontal = Math.round(scene.canvas.height / step);
  const vertical = Math.round(scene.canvas.width / step);
  if (!showGrid || step * 20 < 4) return null;

  return (
    <g pointerEvents="none" opacity={preview ? 0.5 : 0.75}>
      {Array.from({ length: vertical + 1 }).map((_, index) => {
        const x = index * step;
        const major = index % 4 === 0;
        return (
          <line
            key={`gx-${index}`}
            x1={x}
            y1={0}
            x2={x}
            y2={scene.canvas.height}
            stroke="#3a352d"
            strokeWidth={0.012}
            opacity={major ? 0.1 : 0.045}
          />
        );
      })}
      {Array.from({ length: horizontal + 1 }).map((_, index) => {
        const y = index * step;
        const major = index % 4 === 0;
        return (
          <line
            key={`gy-${index}`}
            x1={0}
            y1={y}
            x2={scene.canvas.width}
            y2={y}
            stroke="#3a352d"
            strokeWidth={0.012}
            opacity={major ? 0.1 : 0.045}
          />
        );
      })}
    </g>
  );
}

export function SceneArtwork({
  scene,
  showGrid = true,
  preview = false,
  muted = false,
}: {
  scene: FloorPlanScene;
  showGrid?: boolean;
  preview?: boolean;
  muted?: boolean;
}) {
  const elements = Object.values(scene.elements).sort(
    (left, right) => left.zIndex - right.zIndex,
  );
  return (
    <>
      <rect
        x={0}
        y={0}
        width={scene.canvas.width}
        height={scene.canvas.height}
        fill={scene.canvas.background.color}
        rx={0.06}
      />
      <RoomGrid scene={scene} showGrid={showGrid} preview={preview} />
      {elements.map((element) => (
        <ElementArtwork
          key={element.id}
          scene={scene}
          element={element}
          preview={preview}
          muted={muted}
        />
      ))}
      <rect
        x={0}
        y={0}
        width={scene.canvas.width}
        height={scene.canvas.height}
        fill="none"
        stroke="#5b5347"
        strokeWidth={0.05}
        opacity={0.4}
        pointerEvents="none"
      />
    </>
  );
}

export function FloorPlanPreview({
  scene,
  className,
  showGrid = true,
  label,
  preserveAspectRatio = "xMidYMid meet",
}: {
  scene: FloorPlanScene;
  className?: string;
  showGrid?: boolean;
  label?: string;
  preserveAspectRatio?: string;
}) {
  const { width, height } = scene.canvas;
  return (
    <svg
      viewBox={`${-width * 0.035} ${-height * 0.035} ${width * 1.07} ${height * 1.07}`}
      className={cn("block h-full w-full bg-[#f2eee5]", className)}
      role="img"
      aria-label={label ?? `${scene.name} floor plan preview`}
      preserveAspectRatio={preserveAspectRatio}
    >
      <SceneArtwork scene={scene} showGrid={showGrid} preview />
    </svg>
  );
}
