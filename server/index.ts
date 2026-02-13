import app from './app'
import { PORT, warnIfOAuthNotConfigured } from './config'

warnIfOAuthNotConfigured()

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`)
})
