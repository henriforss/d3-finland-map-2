/* Define svg-size. */
const width = 350
const height = 600

/* Create svg-element. */
const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height)

/* Define projection. */
const projection = d3.geoMercator()
  .scale(1200)
  .translate([-330, 2130])

/* Create path. */
const path = d3.geoPath(projection)

/* Create g-element for paths in map. */
const map = svg.append("g")

/* Create colorScale. */
const colorScale = d3.scaleLinear()
  .domain([-0.05, 0, 0.05])
  .range(["red", "white", "blue"])

/* Create a group-element for the legend. */
const legend = svg.append("g")

/* Create defs-element for linearGradient. */
const defs = legend.append("defs")

/* Create linearGradient. This is the direction of the gradient. */
const linearGradient = defs.append("linearGradient")
  .attr("id", "linear-gradient")
  .attr("x1", "0%")
  .attr("y1", "0%")
  .attr("x2", "0%")
  .attr("y2", "100%")

/* Create "stops" from colorScale. */
linearGradient.selectAll("stop")
  .data(colorScale.range().reverse())
  .enter()
  .append("stop")
  .attr("offset", (d, i) => {
    return i / (colorScale.range().length - 1)
  })
  .attr("stop-color", d => d)

/* Create the rect that contains the gradient, referenced by id. */
legend.append("rect")
  .attr("width", 10)
  .attr("height", 200)
  .style("fill", "url(#linear-gradient)")
  .attr("transform", "translate(20, 50)")

/* Create some lines on the gradient. */
legend.selectAll("line")
  .data([1, 2, 3, 4, 5])
  .enter()
  .append("line")
  .attr("x1", 0)
  .attr("y1", 0)
  .attr("x2", 10)
  .attr("y1", 0)
  .style("stroke", "black")
  .style("stroke-width", 0.25)
  .attr("transform", d => {
    const y = 50
    return `translate(20, ${d * y})`
  })

/* Append some text to the gradient. */
legend.selectAll("text")
  .data(["5%", "2.5%", "0%", "-2.5%", "-5%"])
  .enter()
  .append("text")
  .attr("x", 40)
  .attr("y", (d, i) => {
    return `${(i + 1) * 50 + 5}`
  })
  .text(d => d)
  .attr("stroke", "redblack")
  .attr("font-size", "0.7rem")
  .attr("font-family", "sans-serif")
  .attr("opacity", 1)

/* Define createMap(). This could also be done as a Promise.all.
Which might make the code more consistent. */
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
  map.selectAll("path")
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







// const tooltip = d3.select("#tooltip")
//   .append("div")

// function showTooltip(event) {

//   console.log("moikka")

//   const x = event.clientX
//   const y = event.clientY

//   const point = new DOMPoint(event.clientX, event.clientY)

//   console.log(x, y)
//   console.log(point)

//   tooltip.select("rect")
//     .remove()

//   tooltip.append("rect")
//     .attr("width", 100)
//     .attr("height", 100)
//     .attr("fill", "red")
//     .attr("x", point.x)
//     .attr("y", point.y)
// }





/* Define showData() */
function showData() {
  const clickedMunicipality = d3.select(this).attr("name")
  const municipalityNumber = parseInt(d3.select(this).attr("id"))
  
  d3.select("#info")
    .selectAll("*")
    .remove()

  d3.select("#info")
    .append("h3")
    .text(clickedMunicipality)

  d3.select("#info")
    .append("p")
    .text(`Väestönlisäys: ${populationTable[municipalityNumber].popchange}`)

  d3.select("#info")
    .append("p")
    .text(`Muutos: ${parseFloat(populationTable[municipalityNumber].popchangepercent * 100).toFixed(2)} %`)
}

// /* Create div-element. */
// const div = d3.select("body")
//   .append("div")
//   .attr("class", "div")

/* Run createMap(). */
createMap()