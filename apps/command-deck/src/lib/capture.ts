const MIMES = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"];

let field: HTMLCanvasElement | null = null;
let recorder: MediaRecorder | null = null;
let chunks: Blob[] = [];

export function bindFieldCanvas(el: HTMLCanvasElement | null) {
  field = el;
}

export function fieldCanvas() {
  return field;
}

export function pickRecorderMime(supported?: (type: string) => boolean) {
  const ok = supported ?? ((type: string) => {
    if (typeof MediaRecorder === "undefined") return false;
    return MediaRecorder.isTypeSupported(type);
  });
  return MIMES.find((type) => ok(type)) ?? "";
}

export function captureName(theater: "neural" | "orbit", uhd: boolean) {
  const tag = theater === "orbit" ? "gods-eye" : "neural-link";
  const res = uhd ? "4k" : "field";
  return `the-remote-viewer-${tag}-${res}.webm`;
}

export function bufferIsUhd(canvas: { width: number; height: number } | null) {
  if (!canvas) return false;
  return canvas.width >= 3456 || canvas.height >= 1944;
}

export function isRecording() {
  return Boolean(recorder && recorder.state === "recording");
}

export function canRecordField() {
  if (typeof MediaRecorder === "undefined") return false;
  const el = field;
  if (!el || typeof el.captureStream !== "function") return false;
  return pickRecorderMime().length > 0;
}

function saveBlob(blob: Blob, name: string) {
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 4_000);
}

export function stopFieldCapture() {
  return new Promise<Blob | null>((resolve) => {
    const rec = recorder;
    if (!rec || rec.state === "inactive") {
      recorder = null;
      resolve(null);
      return;
    }
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: rec.mimeType || "video/webm" });
      chunks = [];
      recorder = null;
      resolve(blob);
    };
    rec.stop();
  });
}

export async function toggleFieldCapture(opts: { theater: "neural" | "orbit"; uhd: boolean }) {
  if (isRecording()) {
    const blob = await stopFieldCapture();
    if (blob && blob.size > 0) saveBlob(blob, captureName(opts.theater, opts.uhd || bufferIsUhd(field)));
    return { recording: false, bytes: blob?.size ?? 0 };
  }
  const el = field;
  if (!el || typeof el.captureStream !== "function") {
    throw new Error("Field canvas is not ready to record.");
  }
  const mime = pickRecorderMime();
  if (!mime) throw new Error("This browser cannot record the field.");
  chunks = [];
  const stream = el.captureStream(60);
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: opts.uhd ? 36_000_000 : 12_000_000 });
  rec.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  recorder = rec;
  rec.start(250);
  return { recording: true, bytes: 0 };
}
