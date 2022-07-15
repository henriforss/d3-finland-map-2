/* Define svg-size. */
const width = 350
const height = 600

/* Create svg-element. */
const svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)

/* Define projection. */
const projection = d3.geoMercator()
  .scale(1200)
  .translate([-350, 2130])

/* Create path. */
const path = d3.geoPath(projection)

/* Create g-element for paths. */
const g = svg.append("g")

/* Define createMap(). */
async function createMap() {
  const data = await d3.json("kunnat-clipped.geojson")
  const municipalities = data.features

  const population = await d3.json("kunnat-vaestonmuutos.json")

  /* Create a lookuptable. Using reduce() would be fancier. */
  populationTable = {}
  population.data.forEach((d) => {
    const key = parseInt(d.key[1].slice(2))
    const value = parseInt(d.values[0])
    populationTable[key] = value
  })

  g.selectAll("path")
    .data(municipalities)
    .enter()
    .append("path")
    .attr("id", (d) => d.properties.natcode)
    .attr("fill", (d) => {
      if (populationTable[parseInt(d.properties.natcode)] >= 0) {
        return "lightgreen"
      } else {
        return "pink"
      }
    })
    .attr("class", "municipality")
    .attr("name", (d) => d.properties.namefin)
    .attr("d", path)
    .on("click", showData)
    .append("title")
    .text((d) => d.properties.namefin)
}

/* Define showData() */
function showData() {
  const clickedMunicipality = d3.select(this).attr("name")
  const municipalityNumber = parseInt(d3.select(this).attr("id"))
  
  d3.select(".div")
    .selectAll("*")
    .remove()

  d3.select(".div")
    .append("h3")
    .text(clickedMunicipality)

  d3.select(".div")
    .append("p")
    .text(`Väestönlisäys: ${populationTable[municipalityNumber]}`)
}

/* Create div-element. */
const div = d3.select("body")
  .append("div")
  .attr("class", "div")

/* Run createMap(). */
createMap()