const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { blogs: 0 })
  response.json(blogs)
})

blogRouter.post('/', async (request, response) => {

  if (!request.body.title) return response.status(400).json({ error: 'title is required'})
  if (!request.body.url) return response.status(400).json({ error: 'url is required'})

  const users = await User.find({})
  const blogUser = users.at(Math.random() * users.length)

  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes || 0,
    user: blogUser.id
  })

  const savedBlog = await blog.save()

  blogUser.blogs = blogUser.blogs.concat(savedBlog.id)
  await blogUser.save()

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

  await Blog.findByIdAndDelete(id)
  response.status(204).end()
})

module.exports = blogRouter