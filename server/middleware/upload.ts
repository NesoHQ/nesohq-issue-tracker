import * as multerModule from 'multer'
import { MAX_UPLOAD_SIZE, ALLOWED_IMAGE_TYPES } from '../constants'

const multer =
  (multerModule as unknown as { default?: typeof multerModule }).default ??
  multerModule

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_SIZE },
  fileFilter: (_req, file, cb) => {
    const ok = ALLOWED_IMAGE_TYPES.test(file.mimetype)
    cb(null, ok)
  },
})
