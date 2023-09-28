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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}