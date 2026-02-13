import { Router } from 'express'
import authRoutes from './auth.routes'
import uploadRoutes from './upload.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/upload', uploadRoutes)

export default router
