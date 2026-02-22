import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { CORS_ORIGINS } from './config'
import routes from './routes'

const app = express()

const corsOrigin = CORS_ORIGINS.length > 0 ? CORS_ORIGINS : true
const authRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many authentication requests. Please try again later.' },
})

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: corsOrigin }))
app.use(express.json())
app.use('/api/auth', authRateLimit)
app.use('/api', routes)

export default app
