function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read image"));
    img.src = src;
  });
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

export async function compressImage(file: Blob, maxW: number, maxH: number, quality = 0.82): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    return await compressSrc(url, maxW, maxH, quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function compressSrc(src: string, maxW: number, maxH: number, quality = 0.82): Promise<string> {
  const img = await loadImage(src);
  const scale = Math.min(1, maxW / Math.max(1, img.width), maxH / Math.max(1, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas");
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

export function snapshotVideo(video: HTMLVideoElement, maxW: number, maxH: number, quality = 0.82): string {
  const scale = Math.min(1, maxW / Math.max(1, video.videoWidth), maxH / Math.max(1, video.videoHeight));
  const w = Math.max(1, Math.round((video.videoWidth || maxW) * scale));
  const h = Math.max(1, Math.round((video.videoHeight || maxH) * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas");
  ctx.drawImage(video, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}
