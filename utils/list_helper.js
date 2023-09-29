const _ = require('lodash')

const dummy = (blogs) => {
  // always return 1 if argument is a blog array
  return Array.isArray(blogs) ? 1 : null
}

const totalLikes = (blogs) => {
  if (blogs.length === 0) return 0

  if (blogs.length === 1) return blogs[0].likes

  return blogs.reduce(
    (accumulator, currentValue) => accumulator + currentValue.likes,
    0,
  )
}

const favoriteBlog = (blogs) => {
  let {_id, url, __v, ...favorite} = blogs[0]

  blogs.map( b => {
    if (b.likes > favorite.likes) {
      favorite = {
        title: b.title,
        author: b.author,
        likes: b.likes
      }
    }
  })

  return favorite
}

const mostBlogs = (blogs) => {
  
  function formato (value, key) {
    return {author: key, blogs: value}
  }

  return _.chain(blogs)
    .countBy('author')
    .map(formato)
    .orderBy('blogs', 'desc')
    .head()
    .value()
}

const mostLikes = (blogs) => {
  return _.chain(blogs)
    .groupBy('author').map( (value, key) => {
      return {
        author: key,
        likes: value.reduce((acc, cur) => acc + cur.likes, 0)
      }
    })
    .orderBy('likes', 'desc')
    .head()
    .value()
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}