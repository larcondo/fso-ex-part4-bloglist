const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}, {password: 0})

  response.status(200).json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, password, name } = request.body

  // username MUST BE UNIQUE
  const existingUser = await User.find({ username })
  if (existingUser) return response.status(400).json({ error: 'username must be unique'})

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)
  
  const user = new User({
    username,
    name,
    password: passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = usersRouter