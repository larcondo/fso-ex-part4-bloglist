const middleware = require('../utils/middleware')
const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { blogs: 0 })
  response.json(blogs)
})

blogRouter.post('/', middleware.userExtractor, async (request, response) => {

  if (!request.body.title) return response.status(400).json({ error: 'title is required'})
  if (!request.body.url) return response.status(400).json({ error: 'url is required'})
  
  const user = request.user

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
  
  response.status(200).json(updatedBlog)
})

blogRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const { id } = request.params

  const user = request.user
  const blogObject = await Blog.findById(id)
  
  // only user that create the blog has permission to delete it
  const userHasPermission = blogObject.user.toString() === user.id

  if (!userHasPermission) return response.status(403).json({
    error: 'user does not have permission to delete the blog'
  })
  
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