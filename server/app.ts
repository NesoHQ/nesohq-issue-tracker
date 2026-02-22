import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { CORS_ORIGINS } from './config'
import routes from './routes'

const app = express()

if (CORS_ORIGINS.length === 0) {
  console.warn(
    'Warning: CORS_ORIGIN is not set. All cross-origin requests will be blocked. ' +
      'Set CORS_ORIGIN in server/.env to allow the frontend origin.'
  )
}
const corsOrigin = CORS_ORIGINS.length > 0 ? CORS_ORIGINS : false

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many authentication requests. Please try again later.' },
})

app.use(helmet())
app.use(cors({ origin: corsOrigin }))
app.use(express.json({ limit: '16kb' }))
app.use('/api/auth', authRateLimit)
app.use('/api', routes)

export default app
