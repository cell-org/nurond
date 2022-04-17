const navlinks = (path) => {
  const chunks = path.split("/") 
  // chunks := ["chain", "4", ...]
  let links = []
  for(let i=0; i<chunks.length; i++) {
    // make a link for 0 ~ i
    links.push({
      name: chunks[i],
      href: chunks.slice(0, i+1).join("/")
    })
  }
  return links.map((link) => {
    return `<a href="${link.href}">${link.name}</a>`
  }).join("/")
}
