const jwt = require('jsonwebtoken')
const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { blogs: 0 })
  response.json(blogs)
})

blogRouter.post('/', async (request, response) => {

  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({
      error: 'token invalid'
    })
  }

  if (!request.body.title) return response.status(400).json({ error: 'title is required'})
  if (!request.body.url) return response.status(400).json({ error: 'url is required'})
  
  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes || 0,
    user: user.id
  })

  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog.id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogRouter.put('/:id', async (request, response) => {
  const { id } = request.params
  const { body } = request

  const updatedBlog = await Blog.findByIdAndUpdate(id, body)
  console.log(updatedBlog)
  response.status(200).json(updatedBlog)
})

blogRouter.delete('/:id', async (request, response) => {
  const { id } = request.params

  // delete blog id from user blogs array
  await User.updateMany({}, { 
    $pull: { 
      blogs: { $in: [ id ] } 
    }
  })
  await Blog.findByIdAndDelete(id)
  response.status(204).end()
})

module.exports = blogRouter