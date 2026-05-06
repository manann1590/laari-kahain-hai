export const MAX_MENU_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_MENU_FILE_LABEL = "5 MB";
export const ACCEPTED_MENU_TYPES = "image/jpeg,image/png,image/webp,application/pdf";
export const ACCEPTED_MENU_LABEL = "JPG, PNG, WebP, or PDF";

export type MenuFileFormat = {
  extension: "jpg" | "png" | "webp" | "pdf";
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "application/pdf";
};

function ascii(bytes: Uint8Array, start: number, length: number) {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

export function detectMenuFileFormat(bytes: Uint8Array): MenuFileFormat | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { extension: "jpg", mimeType: "image/jpeg" };
  }
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { extension: "png", mimeType: "image/png" };
  }
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") {
    return { extension: "webp", mimeType: "image/webp" };
  }
  if (bytes.length >= 4 && ascii(bytes, 0, 4) === "%PDF") {
    return { extension: "pdf", mimeType: "application/pdf" };
  }
  return null;
}

export async function detectMenuFile(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  return detectMenuFileFormat(bytes);
}
