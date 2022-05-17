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
  console.log("links", links)
  return links.map((link) => {
    if (link.name.length > 0) {
      return `<a href="${link.href}">${link.name}</a>`
    } else {
      return "<span></span>"
    }
  }).join("<span>/</span>")
}
