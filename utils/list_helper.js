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

module.exports = {
  dummy,
  totalLikes
}