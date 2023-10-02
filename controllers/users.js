const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')
const { PASSWORD_MINLENGTH } = require('../utils/config')

const errorMessages = {
  PASSWORD_REQUIRED: 'User validation failed: password: Path `password` is required.',
  PASSWORD_SHORT: 'User validation failed: password: Path `password` is shorter than the minimum allowed length (' + PASSWORD_MINLENGTH + ').'
}

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}, {password: 0})

  response.status(200).json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, password, name } = request.body

  // missing PASSWORD
  if (!password) return response.status(400).json({ error: errorMessages.PASSWORD_REQUIRED})

  // password MINIMUN LENGTH
  const shortPassword = password.length < PASSWORD_MINLENGTH
  if (shortPassword) return response.status(400).json({ error: errorMessages.PASSWORD_SHORT })

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