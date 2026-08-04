const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')
const fs = require('fs')

dotenv.config()

const backendEnvPath = path.resolve(__dirname, '.env')
const frontendEnvPath = path.resolve(__dirname, '../frontend/.env')

if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath, override: false })
}

if (fs.existsSync(frontendEnvPath)) {
  dotenv.config({ path: frontendEnvPath, override: false })
}

const connectDB = require('./src/config/db')
const authRoutes = require('./src/routes/authRoutes')
const chatRoutes = require('./src/routes/chatRoutes')

const app = express()
const PORT = process.env.PORT || 5000

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true)
      }

      const allowedOrigins = [
        process.env.FRONTEND_URL,
        /^http:\/\/localhost:\d+$/,
        /^http:\/\/127\.0\.0\.1:\d+$/,
      ].filter(Boolean)

      const isAllowed = allowedOrigins.some((allowed) =>
        typeof allowed === 'string' ? allowed === origin : allowed.test(origin),
      )

      return callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed)
    },
  }),
)
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'curalink-api' })
})

app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)

app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Server error'
  res.status(statusCode).json({ message })
})

async function start() {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`Curalink auth API listening on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start backend:', error.message)
    process.exit(1)
  }
}

start()
