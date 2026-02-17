import express from 'express'
import cors from 'cors'
import { UPLOADS_DIR, ensureUploadsDir } from './config'
import routes from './routes'

ensureUploadsDir()

const app = express()

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : true
app.use(cors({ origin: corsOrigin }))
app.use(express.json())

app.use('/api/uploads', express.static(UPLOADS_DIR))
app.use('/api', routes)

export default app
