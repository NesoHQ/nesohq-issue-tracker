import express from 'express'
import cors from 'cors'
import { UPLOADS_DIR, ensureUploadsDir } from './config'
import routes from './routes'

ensureUploadsDir()

const app = express()

app.use(cors({ origin: true }))
app.use(express.json())

app.use('/api/uploads', express.static(UPLOADS_DIR))
app.use('/api', routes)

export default app
