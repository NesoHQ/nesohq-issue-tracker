import path from 'path'
import * as multerModule from 'multer'
import { UPLOADS_DIR } from '../config'
import { MAX_UPLOAD_SIZE, ALLOWED_IMAGE_TYPES } from '../constants'

const multer =
  (multerModule as unknown as { default?: typeof multerModule }).default ??
  multerModule

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png'
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    cb(null, unique)
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_SIZE },
  fileFilter: (_req, file, cb) => {
    const ok = ALLOWED_IMAGE_TYPES.test(file.mimetype)
    cb(null, ok)
  },
})
