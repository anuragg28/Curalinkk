const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/User')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'curalink-dev-secret', {
    expiresIn: '7d',
  })
}

function toUserPayload(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    })

    const token = signToken(user._id)

    return res.status(201).json({
      token,
      user: toUserPayload(user),
    })
  } catch (error) {
    return res.status(500).json({ message: 'Could not create account' })
  }
})

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = signToken(user._id)

    return res.json({
      token,
      user: toUserPayload(user),
    })
  } catch (error) {
    return res.status(500).json({ message: 'Could not sign in' })
  }
})

router.get('/me', protect, async (req, res) => {
  return res.json({ user: toUserPayload(req.user) })
})

module.exports = router
