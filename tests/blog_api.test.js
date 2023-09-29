const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const api = supertest(app)

const initialBlogs = [
  {
    "title": "Profit-focused systematic hierarchy",
    "author": "Fernandina Rudolph",
    "url": "https://admin.ch",
    "likes": 82
  },
  {
    "title": "Robust directional adapter",
    "author": "Lonee Cumbes",
    "url": "http://netvibes.com",
    "likes": 24
  },
  {
    "title": "Persistent 24/7 hardware",
    "author": "Bunni Perrott",
    "url": "https://mail.ru",
    "likes": 66
  },
  {
    "title": "Organized secondary open architecture",
    "author": "Lory Gloy",
    "url": "https://storify.com",
    "likes": 57
  },
  {
    "title": "Networked tangible moratorium",
    "author": "Lona Junifer",
    "url": "http://engadget.com",
    "likes": 85
  }, 
  {
    "title": "Realigned user-facing secured line",
    "author": "Ruperta Matzke",
    "url": "https://barnesandnoble.com",
    "likes": 14
  }, 
  {
    "title": "Customizable asymmetric core",
    "author": "Emma Cornbill",
    "url": "https://spotify.com",
    "likes": 23
  }, 
  {
    "title": "Triple-buffered bifurcated policy",
    "author": "Illa Dalziell",
    "url": "http://narod.ru",
    "likes": 58
  }, 
  {
    "title": "Mandatory upward-trending success",
    "author": "Otho Sonnenschein",
    "url": "http://ehow.com",
    "likes": 25
  }, 
  {
    "title": "Sharable logistical throughput",
    "author": "Serena Housby",
    "url": "http://newyorker.com",
    "likes": 51
  }
]

beforeEach( async () => {
  await Blog.deleteMany({})
  let blogObject = {}
  for (const blog of initialBlogs) {
    blogObject = new Blog(blog)
    await blogObject.save()
  }
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(initialBlogs.length)
})

test('a specific blog title is within the returned blogs', async () => {
  const response = await api.get('/api/blogs')
  const titles = response.body.map( b => b.title)
  expect(titles).toContain('Organized secondary open architecture')
})

test('a specific blog is within the returned blogs', async () => {
  const response = await api.get('/api/blogs')
  const blogs = response.body.map( b => {
    delete b.id
    return b
  })
  expect(blogs).toContainEqual({
    "title": "Triple-buffered bifurcated policy",
    "author": "Illa Dalziell",
    "url": "http://narod.ru",
    "likes": 58
  })
})

test('all blogs has a unique identifier named id', async () => {
  const response = await api.get('/api/blogs')
  response.body.forEach( entry => {
    expect(entry.id).toBeDefined()
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})