import type { Request, Response } from 'express'
import { randomUUID } from 'crypto'
import path from 'path'
import fs from 'fs/promises'
import { Router } from 'express'
import { getApiBaseUrl, UPLOADS_DIR } from '../config'
import { upload } from '../middleware'

const router = Router()

type AllowedImageFormat = 'jpeg' | 'png' | 'gif' | 'webp'

function detectImageFormat(buffer: Buffer): AllowedImageFormat | null {
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png'
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpeg'
  }
  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return 'gif'
  }
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'webp'
  }
  return null
}

/**
 * POST /api/upload
 * Accepts multipart/form-data with field "image".
 * Returns the absolute URL of the uploaded file.
 */
router.post('/', upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  if (!req.file || !req.file.buffer) {
    res.status(400).json({ error: 'No image file provided' })
    return
  }

  const format = detectImageFormat(req.file.buffer)
  if (!format) {
    res.status(415).json({ error: 'Unsupported or invalid image file' })
    return
  }

  const extension = format === 'jpeg' ? 'jpg' : format
  const filename = `${Date.now()}-${randomUUID()}.${extension}`
  const destination = path.join(UPLOADS_DIR, filename)
  try {
    await fs.writeFile(destination, req.file.buffer, { flag: 'wx' })
    const base = getApiBaseUrl(req.headers.origin as string | undefined)
    const baseUrl = base.replace(/\/$/, '')
    const url = `${baseUrl}/api/uploads/${filename}`
    res.json({ url })
  } catch (err) {
    console.error('Upload write error:', err)
    res.status(500).json({ error: 'Failed to save image' })
  }
})

export default router
