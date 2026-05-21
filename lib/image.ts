/**
 * Compress + center-crop an uploaded image into a square data URL suitable for
 * stashing in localStorage as the user's profile avatar.
 *
 * Targets: 256x256 JPEG @ 0.85 quality → typically 25–55 KB.
 */
export async function compressToAvatar(
  file: File,
  size = 256,
  quality = 0.85,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please pick an image file (JPEG, PNG, or WebP).");
  }

  const bitmap = await createBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't initialize canvas.");

  // Cover-style center crop: scale so the smaller side fills size, then crop.
  const srcW = bitmap.width;
  const srcH = bitmap.height;
  const scale = size / Math.min(srcW, srcH);
  const drawW = srcW * scale;
  const drawH = srcH * scale;
  const dx = (size - drawW) / 2;
  const dy = (size - drawH) / 2;

  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, dx, dy, drawW, drawH);

  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  return dataUrl;
}

async function createBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  // Prefer createImageBitmap when available — much faster than HTMLImageElement.
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // Some formats (e.g. some HEIC on certain browsers) fall through to <img>.
    }
  }
  return await loadAsImage(file);
}

function loadAsImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't decode this image. Try a JPEG or PNG."));
    };
    img.src = url;
  });
}
