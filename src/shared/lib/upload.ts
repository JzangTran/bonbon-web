const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
/** Same ceiling as the server (ImageSanitizer): longest side in pixels. */
export const MAX_IMAGE_SIDE = 10_000

/**
 * Checks a picked file before it is sent, with the same rules the server applies: type, size, and for pictures that the
 * browser can read it and its sides are sane. Returns a message for the person, or null when the file is fine.
 * The server checks again (it never trusts the browser); this only saves a failed upload.
 */
export async function checkUpload(file: File, { maxMb, pdf = false }: { maxMb: number; pdf?: boolean }): Promise<string | null> {
  const isPdf = file.type === 'application/pdf'
  if (!IMAGE_TYPES.includes(file.type) && !(pdf && isPdf)) {
    return pdf ? 'Chỉ nhận ảnh JPG, PNG, WebP hoặc tệp PDF.' : 'Chỉ nhận ảnh JPG, PNG hoặc WebP.'
  }
  if (file.size === 0) return 'Tệp trống.'
  if (file.size > maxMb * 1024 * 1024) return `Tệp lớn hơn ${maxMb} MB. Hãy chọn tệp nhỏ hơn.`
  if (isPdf) return null
  try {
    const bitmap = await createImageBitmap(file)
    const { width, height } = bitmap
    bitmap.close()
    if (width > MAX_IMAGE_SIDE || height > MAX_IMAGE_SIDE) return `Ảnh quá lớn (tối đa ${MAX_IMAGE_SIDE} px mỗi cạnh).`
  } catch {
    return 'Không đọc được ảnh này. Hãy chọn ảnh khác.'
  }
  return null
}

/** The files of a pick that pass `checkUpload`; every refusal is reported through `onProblem` with the file's name. */
export async function acceptUploads(files: File[], options: { maxMb: number; pdf?: boolean }, onProblem: (message: string) => void): Promise<File[]> {
  const accepted: File[] = []
  for (const file of files) {
    const problem = await checkUpload(file, options)
    if (problem) onProblem(`${file.name}: ${problem}`)
    else accepted.push(file)
  }
  return accepted
}
