export const MAX_UPLOAD_IMAGE_BYTES = 300 * 1024;
export const MAX_UPLOAD_IMAGE_LABEL = "300 KB";
export const ACCEPTED_UPLOAD_IMAGE_TYPES = "image/jpeg,image/png,image/gif,image/webp";
export const ACCEPTED_UPLOAD_IMAGE_LABEL = "JPG, PNG, GIF, or WebP";

export type UploadImageFormat = {
  extension: "gif" | "jpg" | "png" | "webp";
  mimeType: "image/gif" | "image/jpeg" | "image/png" | "image/webp";
};

const SIGNATURE_BYTES_TO_READ = 16;

function ascii(bytes: Uint8Array, start: number, length: number) {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

export function detectUploadImageFormat(bytes: Uint8Array): UploadImageFormat | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { extension: "jpg", mimeType: "image/jpeg" };
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { extension: "png", mimeType: "image/png" };
  }

  if (bytes.length >= 6 && (ascii(bytes, 0, 6) === "GIF87a" || ascii(bytes, 0, 6) === "GIF89a")) {
    return { extension: "gif", mimeType: "image/gif" };
  }

  if (bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") {
    return { extension: "webp", mimeType: "image/webp" };
  }

  return null;
}

export async function detectUploadImageFile(file: File) {
  const bytes = new Uint8Array(await file.slice(0, SIGNATURE_BYTES_TO_READ).arrayBuffer());
  return detectUploadImageFormat(bytes);
}
