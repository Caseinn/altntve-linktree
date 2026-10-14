import { BACKGROUND } from "@/config/brand"

/**
 * Centre-crops an upload to the plate's ratio so the dashboard preview shows the
 * stored result rather than the raw file.
 *
 * Uses the same cover maths as `lib/background.ts`, and matches its `.rotate()`
 * with `imageOrientation: "from-image"` so EXIF-rotated phone photos crop
 * identically on both sides.
 *
 * @param file - The admin's raw upload.
 * @returns A blob of the cropped image, ready for an object URL.
 */
export async function cropToPlate(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  })

  try {
    const canvas = document.createElement("canvas")
    canvas.width = BACKGROUND.width
    canvas.height = BACKGROUND.height

    const context = canvas.getContext("2d")
    if (!context) throw new Error("Canvas is unavailable")

    const scale = Math.max(
      BACKGROUND.width / bitmap.width,
      BACKGROUND.height / bitmap.height,
    )
    const width = bitmap.width * scale
    const height = bitmap.height * scale

    context.drawImage(
      bitmap,
      (BACKGROUND.width - width) / 2,
      (BACKGROUND.height - height) / 2,
      width,
      height,
    )

    return await toBlob(canvas)
  } finally {
    bitmap.close()
  }
}

function toBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Canvas produced no blob")),
      "image/webp",
      0.9,
    )
  })
}
