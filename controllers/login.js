const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  if (!username) return response.status(401).json({ error: 'username required'})
  if (!password) return response.status(401).json({ error: 'password required'})
  
  const user = await User.findOne({ username })
  if (!user) return response.status(401).json({ error: 'username does not exist'})

  const passwordCorrect = await bcrypt.compare(password, user.password)  
  if (!passwordCorrect) return response.status(401).json({ error: 'password is incorrect' })

  const userForToken = {
    username: user.username,
    id: user._id
  }

  const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 5*60 })

  response
    .status(200)
    .send({
      token,
      username: user.username,
      name: user.name
    })

})

module.exports = loginRouter