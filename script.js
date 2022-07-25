/* Define mapSelecter for selecting maps. */
let mapSelector = 1

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
  .translate([-350, 2100])

/* Create path. */
const path = d3.geoPath(projection)

/* Create background-rect. */
const background = svg.append("rect")
  .attr("width", width)
  .attr("height", height)
  .attr("fill", "#eee")
  .on("click", hideTooltip)

/* Create g-element for paths in map. */
const map = svg.append("g")




/* Create colorScale1 (population). */
const colorScale1 = d3.scaleLinear()
  .domain([-0.05, 0, 0.05])
  .range(["red", "white", "blue"])

/* Create colorScale3 (healthcare). */
const colorScale3 = d3.scaleLinear()
  .domain([2400, 6800])
  .range(["yellow", "purple"])

  


/* Create background-element for legend. */
const legendBackgound = svg.append("rect")
  .attr("width", width)
  .attr("height", 70)
  .attr("fill", "#eee")
  .attr("transform", `translate(0, ${height - 70})`)

/* Create a group-element for the legend. */
const legend = svg.append("g")

/* Create defs-element for linearGradient. */
const defs = legend.append("defs")

/* Create linearGradient. This is the direction of the gradient. */
const linearGradient = defs.append("linearGradient")
  .attr("id", "linear-gradient")
  .attr("x1", "0%")
  .attr("y1", "0%")
  .attr("x2", "100%")
  .attr("y2", "0%")

/* Create "stops" from colorScale. */
linearGradient.selectAll("stop")
  .data(colorScale1.range())
  .enter()
  .append("stop")
  .attr("offset", (d, i) => {
    return i / (colorScale1.range().length - 1)
  })
  .attr("stop-color", d => d)

/* Create the rect that contains the gradient, referenced by id. */
legend.append("rect")
  .attr("width", 300)
  .attr("height", 10)
  .style("fill", "url(#linear-gradient)")
  .attr("transform", "translate(25, 560)")

// /* Create some lines on the gradient. */
// legend.selectAll("line")
//   .data([0, 1, 2, 3, 4])
//   .enter()
//   .append("line")
//   .attr("x1", 0)
//   .attr("y1", 0)
//   .attr("x2", 0)
//   .attr("y2", 10)
//   .style("stroke", "black")
//   .style("stroke-width", 0.25)
//   .attr("transform", d => {
//     const start = 25
//     const x = 75
//     return `translate(${d * x + start}, 560)`
//   })

/* Append some text to the gradient. */
legend.selectAll("text")
  .data(["-5%", "-2.5%", "0%", "2.5%", "5%"])
  .enter()
  .append("text")
  .attr("y", 585)
  .attr("x", (d, i) => {

    return `${(i) * 71 + 25}`
  })
  .text(d => d)
  .attr("font-size", "0.7rem")
  .attr("font-family", "sans-serif")
  .attr("opacity", 0.8)

/* Append more text to the legend. */
legend.append("text")
  .attr("transform", "translate(25, 550)")
  .attr("font-size", "0.7rem")
  .attr("font-family", "sans-serif")
  .text("*Muutos prosenteissa verrattuna edelliseen vuoteen.")

/* Define handleZoom. */
const handleZoom = (e) => {
  d3.select("g")
    .attr("transform", e.transform)
    .call(hideTooltip)
}

/* Define zoom. */
const zoom = d3.zoom()
  .scaleExtent([1, 5])
  .translateExtent([[0, 0], [width, height]])
  .on("zoom", handleZoom)

/* Define initZoom. */
const initZoom = () => {
  d3.select("svg")
    .call(zoom)
}

/* Define createMap(). This could also be done as a Promise.all.
Which might make the code more consistent. */
async function createMap(mapnumber) {
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

  /* Assign values in populationTable to municipalities. No need to look up
  data when all data is in same place. */
  municipalities.forEach(d => {
    Object.assign(d.properties, populationTable[parseInt(d.properties.natcode)])
  })
  
  /* Create a lookup table for healthcare. Same as above. */
  healthcareTable = {}
  const healthcare = await d3.csv("kunnat-terveydenhoito.csv", (data) => {
    const key = data.municipality
    const value = parseInt(data.healthcareperperson)
    
    healthcareTable[key] = {
      healthcarecost: value,
    }
  })
  
  const vals = Object.values(healthcareTable).map(d => d.healthcarecost)

  console.log(Math.max(...vals), Math.min(...vals))

  



  /* Assign values in healthcareTable to municipalities. Same as above. */
  municipalities.forEach(d => {
    if (healthcareTable[d.properties.namefin] != undefined) {
      Object.assign(d.properties, healthcareTable[d.properties.namefin])
    }
  })





  /* Draw paths depending on which map the user chooses. */
  if (mapnumber == 1) {
    map.selectAll("path")
      .remove()

    map.selectAll("path")
      .data(municipalities)
      .enter()
      .append("path")
      .attr("id", (d) => d.properties.natcode)
      .attr("fill", d => colorScale1(d.properties.popchangepercent))
      .attr("class", "municipality")
      .attr("name", (d) => d.properties.namefin)
      .attr("d", path)
      .on("click", showTooltip)
  } else if (mapnumber == 3) {
    map.selectAll("path")
      .remove()

    map.selectAll("path")
      .data(municipalities)
      .enter()
      .append("path")
      .attr("id", d => d.properties.natcode)
      .attr("fill", d => {
        if (d.properties.healthcarecost != undefined) {
          return colorScale3(d.properties.healthcarecost)
        } else {
          return "white"
        }
      })
      .attr("class", "municipality")
      .attr("name", d => d.properties.namefin)
      .attr("d", path)

  }
}






/* Select tooltip-element. */
const tooltip = d3.select("#tooltip")

/* Create p-element inside tooltip-div. */
const tooltipNode = document.getElementById("tooltip")
const tooltipNodeElement = document.createElement("p")
tooltipNode.appendChild(tooltipNodeElement)

/* Function to show tooltip. */
function showTooltip(event) {
  
  d3.selectAll("path")
    .style("opacity", 0.4)

  const selected = d3.select(this)
  selected.style("opacity", 1.0)

  const selectedProperties = selected._groups[0][0].__data__.properties

  const x = event.clientX
  const y = event.clientY + window.scrollY
    
  tooltip
    .style("left", d => `${x - 75}px`)
    .style("top", d => `${y - 90}px`)
    .style("visibility", "visible")
    .on("click", hideTooltip)

  tooltipNodeElement.innerHTML = `<b>${selectedProperties.namefin}</b><br>
    Väestönlisäys: ${selectedProperties.popchange}<br>
    Muutos: ${(selectedProperties.popchangepercent * 100).toFixed(2)}%`
}

/* Function to hide tooltip. */
function hideTooltip() {

  d3.selectAll("path")
    .style("opacity", 1)

  tooltip
    .style("visibility", "hidden")
}

/* Dropdown */
const dropdownNode = document.getElementById("dropdown")
const dropdownNodeElement = document.createElement("select")
dropdownNode.appendChild(dropdownNodeElement)
dropdownNodeElement.innerHTML =
  "<option value='population'>Väestönkehitys</option><option value='economy'>Talous</option><option value='healthcare'>Terveydenhoitokustannukset</option>"

/* Dropdown event listener. */
dropdownNodeElement.addEventListener("change", handleSelect)

/* Dropdown event handler. */
function handleSelect(event) {
  const selection = event.target.value

  if (selection == "economy") {
    console.log("ekko")
  } else if (selection == "healthcare") {
    mapSelector = 3
    createMap(mapSelector)
  } else if (selection == "population") {
    mapSelector = 1
    createMap(mapSelector)
  }
}





/* Run initZoom(). */
initZoom()

/* Run createMap(). */
createMap(mapSelector)