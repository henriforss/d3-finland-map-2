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

/* Create colorScale. */
const colorScale = d3.scaleLinear()
  .domain([-0.05, 0, 0.05])
  .range(["red", "white", "blue"])

/* Define createMap(). */
async function createMap() {
  const data = await d3.json("kunnat-clipped.geojson")
  const municipalities = data.features

  const population = await d3.json("kunnat-vaestonmuutos-2.json")

  /* Create a lookup table. Using reduce() would be fancier. */
  populationTable = {}
  population.data.forEach((d) => {
    const key = parseInt(d.key[1].slice(2))
    const value1 = parseInt(d.values[0]) // absolute change
    const value2 = parseInt(d.values[1]) // absolute population
    const value3 = value1 / value2 // percentage change

    /* Create entries for populationTable. */
    populationTable[key] = {
      popchange: value1,
      popsize: value2,
      popchangepercent: value3,
    }
  })

  /* Assign values in populationTable to municipalities. No need to look up data when all data is in same place. */
  municipalities.forEach(d => {
    Object.assign(d.properties, populationTable[parseInt(d.properties.natcode)])
  })
  
  /* Draw paths. */
  g.selectAll("path")
    .data(municipalities)
    .enter()
    .append("path")
    .attr("id", (d) => d.properties.natcode)
    .attr("fill", d => colorScale(d.properties.popchangepercent))
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
    .text(`Väestönlisäys: ${populationTable[municipalityNumber].popchange}`)

  d3.select(".div")
    .append("p")
    .text(`Muutos: ${parseFloat(populationTable[municipalityNumber].popchangepercent * 100).toFixed(2)} %`)
}

/* Create div-element. */
const div = d3.select("body")
  .append("div")
  .attr("class", "div")

/* Run createMap(). */
createMap()