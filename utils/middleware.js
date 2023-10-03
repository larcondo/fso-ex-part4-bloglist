const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const requestLogger = (req, res, next) => {
  logger.info(`Methor: ${req.method} | Path: ${req.path} | Body: ${JSON.stringify(req.body)}`)
  next()
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'token must be provided' })
  } else if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'token expired' })
  }

  next(error)
}

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    req.token = authorization.replace('Bearer ', '')
    next()
  } else {
    return res.status(401).json({ error: 'token invalid' })
  }
}

const userExtractor = async (req, res, next) => {
  const authorization = req.get('authorization')
  
  if (!authorization) res.status(401).json({ error: 'unauthenticated' })

  if (authorization && authorization.startsWith('Bearer ')) {
    const token = authorization.replace('Bearer ', '')
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id) 
      return res.status(401).json({ error: 'token invalid' })
    
    req.user = await User.findById(decodedToken.id)
    next()
  } else {
    return res.status(401).json({ error: 'token required' })
  }

}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
}