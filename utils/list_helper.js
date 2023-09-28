const dummy = (blogs) => {
  // always return 1 if argument is a blog array
  return Array.isArray(blogs) ? 1 : null
}

module.exports = {
  dummy
}