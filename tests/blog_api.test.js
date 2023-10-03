const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const api = supertest(app)
const bcrypt = require('bcrypt')
const { PASSWORD_MINLENGTH } = require('../utils/config')

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
  for (const blog of initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }

  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', password: passwordHash })
  await user.save()
  const user2 = new User({ username: 'stranger', password: await bcrypt.hash('secretword', 10)})
  await user2.save()
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

test('a blog can be added', async () => {
  const user = { username: 'root', password: 'sekret' }

  const userResponse = await api
    .post('/api/login')
    .send(user)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(userResponse.body.token).toBeDefined()

  const newBlog = {
    title: 'Extended logistical initiative',
    author: 'Ruperta Matzke',
    url: 'http://smugmug.com',
    likes: 11
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${userResponse.body.token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  
  const response = await api
    .get('/api/blogs')
    .expect(200)

  const blogs = response.body.map( b => {
    const {id, user, ...rest} = b
    return rest
  })
  expect(response.body).toHaveLength(initialBlogs.length + 1)
  expect(blogs).toContainEqual(newBlog)
  response.body.forEach( entry => {
    expect(entry.id).toBeDefined()
  })
})

test('verify default value for likes property', async () => {
  const user = { username: 'root', password: 'sekret' }

  const userResponse = await api
    .post('/api/login')
    .send(user)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(userResponse.body.token).toBeDefined()

  const newBlog = {
    title: 'Fundamental dedicated capability',
    author: 'Friedrick Pina',
    url: 'https://princeton.edu',
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${userResponse.body.token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  
  const response = await api.get('/api/blogs')
  const blog = response.body.find(b => b.title === newBlog.title)
  
  expect(blog.id).toBeDefined()
  expect(blog.likes).toBeDefined()
  expect(blog.likes).toBe(0)
})

describe('missing properties', () => {
  let token = ''

  beforeEach( async () => {
    const { body } = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })
    
    token = body.token
  })

  test('add blog with missing title must fail', async () => {
    const newBlog = {
      author: 'Alessandra Di Dello',
      url: 'https://privacy.gov.au',
      likes: 4
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toBeDefined()
    expect(response.body).toEqual({
      error: 'title is required'
    })

    const blogsInDb = await api.get('/api/blogs')
    expect(blogsInDb.body).toHaveLength(initialBlogs.length)
  })

  test('add blog with missing url must fail', async () => {
    const newBlog = {
      title: 'Re-contextualized global encryption',
      author: 'Rabi Chown',
      likes: 10
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toBeDefined()
    expect(response.body).toEqual({
      error: 'url is required'
    })

    const blogsInDb = await api.get('/api/blogs')
    expect(blogsInDb.body).toHaveLength(initialBlogs.length)
  })
})

describe('delete blogs', () => {
  let token = ''
  let token2 = ''
  let blogId = ''

  const blog = {
    "title": "Devolved actuating circuit",
    "author": "Miranda Jamrowicz",
    "url": "http://angelfire.com",
    "likes": 117
  }

  beforeEach( async () => {
    const { body } = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })
    
    token = body.token
    
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blog)

    blogId =  response.body.id

    const { body: body2 } = await api
      .post('/api/login')
      .send({ username: 'stranger', password: 'secretword' })

    token2 = body2.token
  })


  test('delete a specific blog', async () => {
    const blogsBeforeDelete = await api.get('/api/blogs')

    await api
      .delete(`/api/blogs/${blogId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
    
    const blogsAfterDelete = await api.get('/api/blogs')
    expect(blogsAfterDelete.body).toHaveLength(blogsBeforeDelete.body.length - 1)
    
    const titles = blogsAfterDelete.body.map( b => b.title)
    expect(titles).not.toContain(blog.title)
  })

  test(`user deletes another user's blog must fail`, async () => {
    const blogsBeforeDelete = await api.get('/api/blogs')

    const { body } = await api
      .delete(`/api/blogs/${blogId}`)
      .set('Authorization', `Bearer ${token2}`)
      .expect(403)
    
    expect(body.error).toBe('user does not have permission to delete the blog')
    const blogsAfterDelete = await api.get('/api/blogs')
    expect(blogsAfterDelete.body).toHaveLength(blogsBeforeDelete.body.length)
  })
})

describe('update blogs', () => {
  test('update a specific blog', async () => {
    const blogs = await api.get('/api/blogs')
    const blogToUpdate = blogs.body[5]

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ 
        likes: blogToUpdate.likes + 5,
        author: 'John Doe',
        title: 'Testing updating operations'
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAfterUpdate = await api.get('/api/blogs')
    expect(blogsAfterUpdate.body).toHaveLength(initialBlogs.length)
    const updatedBlog = blogsAfterUpdate.body.find(b => b.id === blogToUpdate.id)
    
    expect(updatedBlog.likes).toBe(blogToUpdate.likes + 5)
    expect(updatedBlog.title).toBe('Testing updating operations')
    expect(updatedBlog.author).toBe('John Doe')
  })
})

describe('when there is initially one user in db', () => {
  
  test('creation of a new user succeeds', async () => {
    const usersBefore = await User.find({})

    const newUser = {
      username: 'tshaw',
      name: 'Taylor Shaw',
      password: 'BlinDspoT'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAfter = await User.find({})
    expect(usersAfter).toHaveLength(usersBefore.length + 1)

    const usernames = usersAfter.map( u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('username must be unique', async () => {
    const usersBefore = await User.find({})
    const newUser = {
      username: 'root',
      password: 'othersekret',
      name: 'admin'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAfter = await User.find({})
    expect(usersAfter).toHaveLength(usersBefore.length)
  })

  test('short password', async () => {
    const usersBefore = await User.find({})
    const newUser = {
      username: 'mytestuser',
      password: 'se',
      name: 'admin'
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toBeDefined()
    expect(response.body.error).toBe(
      'User validation failed: password: Path `password` is shorter than the minimum allowed length ('
      + PASSWORD_MINLENGTH + 
      ').'
    )
    const usersAfter = await User.find({})
    expect(usersAfter).toHaveLength(usersBefore.length)
  })

  test('short username', async () => {
    const usersBefore = await User.find({})
    const newUser = {
      username: 'my',
      password: 'sekret',
      name: 'admin'
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toBeDefined()
    expect(response.body.error).toContain('User validation failed: username')
    const usersAfter = await User.find({})
    expect(usersAfter).toHaveLength(usersBefore.length)
  })

  test('missing password', async () => {
    const usersBefore = await User.find({})
    const newUser = {
      username: 'myseconduser',
      name: 'admin'
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    expect(response.body.error).toBeDefined()
    expect(response.body.error).toBe('User validation failed: password: Path `password` is required.')
    const usersAfter = await User.find({})
    expect(usersAfter).toHaveLength(usersBefore.length)
  })

  test('missing username', async () => {
    const usersBefore = await User.find({})
    const newUser = {
      password: 'sekret1',
      name: 'admin'
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    expect(response.body.error).toBeDefined()
    expect(response.body.error).toContain('User validation failed: username')
    const usersAfter = await User.find({})
    expect(usersAfter).toHaveLength(usersBefore.length)
  })
})

describe('token is not provided', () => {
  const newBlog = {
    "title": "Open-architected client-driven definition",
    "author": "Leonore Horley",
    "url": "http://opensource.org",
    "likes": 115
  }

  test('adding a blog', async () => {
    const { body: blogsBefore } = await api.get('/api/blogs')

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer 1jh3431jsdas14jb52`)
      .send(newBlog)
      .expect(401)
    
    expect(response.body.error).toBeDefined()
    expect(response.body.error).toBe('token must be provided')

    const { body: blogsAfter } = await api.get('/api/blogs')
    expect(blogsAfter).toHaveLength(blogsBefore.length)
    expect(blogsAfter).toEqual(blogsBefore)
  })
  
  test('adding a blog without authorization header', async () => {
    const { body: blogsBefore } = await api.get('/api/blogs')

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
    
    expect(response.body.error).toBeDefined()
    expect(response.body.error).toBe('unauthenticated')

    const { body: blogsAfter } = await api.get('/api/blogs')
    expect(blogsAfter).toHaveLength(blogsBefore.length)
    expect(blogsAfter).toEqual(blogsBefore)
  })

  test('adding a blog with wrong authorization header', async () => {
    const { body: blogsBefore } = await api.get('/api/blogs')

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `1jh3431jsdas14jb52`)
      .send(newBlog)
      .expect(401)
    
    expect(response.body.error).toBeDefined()
    expect(response.body.error).toBe('token required')

    const { body: blogsAfter } = await api.get('/api/blogs')
    expect(blogsAfter).toHaveLength(blogsBefore.length)
    expect(blogsAfter).toEqual(blogsBefore)
  })

  test('deleting a blog', async () => {
    const { body: blogsBefore } = await api.get('/api/blogs')

    const response = await api
      .delete('/api/blogs/651c645c98e5ed848598fff4')
      .set('Authorization', `Bearer 1jh3431jsdas14jb52`)
      .expect(401)

    expect(response.body.error).toBeDefined()
    expect(response.body.error).toBe('token must be provided')

    const { body: blogsAfter } = await api.get('/api/blogs')
    expect(blogsAfter).toHaveLength(blogsBefore.length)
    expect(blogsAfter).toEqual(blogsBefore)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})