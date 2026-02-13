import type { Request, Response } from 'express'
import { Router } from 'express'
import { getApiBaseUrl } from '../config'
import { upload } from '../middleware'

const router = Router()

/**
 * POST /api/upload
 * Accepts multipart/form-data with field "image".
 * Returns the absolute URL of the uploaded file.
 */
router.post('/', upload.single('image'), (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ error: 'No image file provided' })
    return
  }

  const base = getApiBaseUrl(req.headers.origin as string | undefined)
  const baseUrl = base.replace(/\/$/, '')
  const url = `${baseUrl}/api/uploads/${req.file.filename}`

  res.json({ url })
})

export default router
