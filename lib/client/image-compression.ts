import {
  ACCEPTED_UPLOAD_IMAGE_LABEL,
  detectUploadImageFile,
  MAX_UPLOAD_IMAGE_BYTES,
  MAX_UPLOAD_IMAGE_LABEL,
} from "@/lib/image-upload";

const TARGET_IMAGE_BYTES = 285 * 1024;
const INITIAL_MAX_DIMENSION = 1600;
const MIN_DIMENSION = 480;
const DIMENSION_STEP = 0.85;
const QUALITY_STEPS = [0.82, 0.74, 0.66, 0.58, 0.5, 0.44, 0.38];

function fileBaseName(name: string) {
  return name.replace(/\.[^.]+$/, "") || "report-image";
}

function scaledDimensions(width: number, height: number, maxDimension: number) {
  const largestSide = Math.max(width, height);
  const scale = largestSide > maxDimension ? maxDimension / largestSide : 1;

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("This image could not be read. Try a JPG or PNG photo."));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("This browser could not compress the image."));
      },
      "image/jpeg",
      quality,
    );
  });
}

function drawImage(image: HTMLImageElement, maxDimension: number) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("This browser could not prepare the image.");
  }

  const size = scaledDimensions(image.naturalWidth, image.naturalHeight, maxDimension);
  canvas.width = size.width;
  canvas.height = size.height;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, size.width, size.height);
  context.drawImage(image, 0, 0, size.width, size.height);

  return canvas;
}

async function compressImageFile(file: File) {
  const image = await loadImage(file);
  let bestBlob: Blob | null = null;
  let maxDimension = Math.min(Math.max(image.naturalWidth, image.naturalHeight), INITIAL_MAX_DIMENSION);

  while (maxDimension >= MIN_DIMENSION) {
    const canvas = drawImage(image, maxDimension);

    for (const quality of QUALITY_STEPS) {
      const blob = await canvasToBlob(canvas, quality);

      if (blob.size <= TARGET_IMAGE_BYTES) {
        return new File([blob], `${fileBaseName(file.name)}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
      }

      if (!bestBlob || blob.size < bestBlob.size) {
        bestBlob = blob;
      }
    }

    maxDimension = Math.floor(maxDimension * DIMENSION_STEP);
  }

  if (bestBlob && bestBlob.size <= MAX_UPLOAD_IMAGE_BYTES) {
    return new File([bestBlob], `${fileBaseName(file.name)}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  }

  throw new Error(`Could not shrink this image below ${MAX_UPLOAD_IMAGE_LABEL}. Try taking a closer photo or cropping it first.`);
}

export async function compressFormImage(formData: FormData, fieldName: string) {
  const file = formData.get(fieldName);

  if (!(file instanceof File) || file.size === 0) {
    return formData;
  }

  const imageFormat = await detectUploadImageFile(file);
  if (!imageFormat) {
    throw new Error(`Only ${ACCEPTED_UPLOAD_IMAGE_LABEL} image uploads are supported.`);
  }

  if (!document.createElement("canvas").toBlob) {
    if (file.size <= MAX_UPLOAD_IMAGE_BYTES) return formData;
    throw new Error(`This browser cannot compress images. Upload an image smaller than ${MAX_UPLOAD_IMAGE_LABEL}.`);
  }

  const compressedFile = await compressImageFile(file);
  formData.set(fieldName, compressedFile, compressedFile.name);

  return formData;
}
