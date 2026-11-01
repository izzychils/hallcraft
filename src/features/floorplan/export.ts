import type { FloorPlanScene } from "./types";

function cloneSvgForExport(svg: SVGSVGElement) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const viewBox = svg.getAttribute("viewBox")?.split(" ").map(Number) ?? [0, 0, 100, 100];
  const ratio = viewBox[2] / viewBox[3];
  const width = 1800;
  const height = Math.round(width / ratio);
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  // Remove editor-only artefacts that may be present in the capture node.
  clone.querySelectorAll("[data-export-ignore]").forEach((node) => node.remove());
  return { clone, width, height };
}

function triggerDownload(url: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
}

export function exportSceneAsPng(svg: SVGSVGElement, scene: FloorPlanScene) {
  return new Promise<void>((resolve, reject) => {
    const { clone, width, height } = cloneSvgForExport(svg);
    const markup = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("The canvas could not be prepared."));
        return;
      }
      context.fillStyle = "#f6f2e8";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(url);
      const slug = scene.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      triggerDownload(canvas.toDataURL("image/png"), `${slug || "hallcraft-plan"}.png`);
      resolve();
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("The plan image could not be generated."));
    };
    image.src = url;
  });
}

export function printSceneAsPdf(svg: SVGSVGElement, scene: FloorPlanScene) {
  const { clone } = cloneSvgForExport(svg);
  clone.removeAttribute("width");
  clone.removeAttribute("height");
  clone.setAttribute("style", "width:100%;height:auto;display:block");
  const markup = new XMLSerializer().serializeToString(clone);
  const frame = window.open("", "_blank", "width=1100,height=800");
  if (!frame) throw new Error("Your browser blocked the print window.");
  frame.document.write(`<!doctype html>
<html>
<head>
<title>${scene.name}: Hallcraft plan</title>
<style>
  @page { size: A4 portrait; margin: 14mm; }
  body { margin: 0; background: #f5f2ec; color: #171510; font-family: Inter, Helvetica Neue, Arial, sans-serif; }
  header { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:1px solid #d8d1c3; padding: 8px 2px 12px; margin-bottom: 16px; }
  h1 { font-size: 20px; margin: 0; letter-spacing: -0.02em; }
  p { margin: 2px 0 0; font-size: 10px; color: #746d60; }
  main { border: 1px solid #d8d1c3; background: #fffdf8; }
  footer { margin-top: 10px; display:flex; justify-content:space-between; font-size: 9px; color: #8a8376; }
</style>
</head>
<body>
  <header>
    <div>
      <h1>${escapeHtml(scene.name)}</h1>
      <p>${escapeHtml(scene.venueName || "Venue to confirm")} · ${escapeHtml(
        scene.eventType || "Event",
      )} · ${scene.guestCount ?? 0} guests</p>
    </div>
    <p>${scene.canvas.width} × ${scene.canvas.height} m · scale 1:100</p>
  </header>
  <main>${markup}</main>
  <footer>
    <span>Hallcraft · spatial plan</span>
    <span>Planning reference only. Verify measurements on site.</span>
  </footer>
  <script>window.onload = () => { setTimeout(() => window.print(), 400); };</script>
</body>
</html>`);
  frame.document.close();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function exportSceneAsJson(scene: FloorPlanScene) {
  const slug = scene.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const blob = new Blob([JSON.stringify(scene, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${slug || "hallcraft-plan"}.json`);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
