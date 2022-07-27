/* Variable to choose map. */
let mapSelector = "population"

/* Event handler to hide tooltips if screen orientation is changed. */
screen.orientation.addEventListener("change", () => {
  hideTooltip()
})

/* Create dropdown menu to select map. */
const dropdownNode = document.getElementById("dropdown")
const dropdownNodeElement = document.createElement("select")
dropdownNode.appendChild(dropdownNodeElement)
dropdownNodeElement.innerHTML =
  "<option selected='selected' value='population'>Väestönkehitys</option><option value='economy'>Talous</option><option value='healthcare'>Terveydenhoitokustannukset</option>"

/* Dropdown event listener. */
dropdownNodeElement.addEventListener("change", handleSelect)

/* Dropdown event handler. */
function handleSelect(event) {
  mapSelector = event.target.value
  createMap(mapSelector)
}

/* Define projection. */
const projection = d3.geoMercator()
  .scale(1200)
  .translate([-350, 2100])

/* Create path. */
const path = d3.geoPath(projection)

/* Define svg-size. */
const width = 350
const height = 600

/* Create svg-element. */
const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height)

/* Create background-rect. */
const background = svg.append("rect")
  .attr("width", width)
  .attr("height", height)
  .attr("fill", "#eee")
  .on("click", hideTooltip)

/* Create g-element for paths in map. */
const map = svg.append("g")

/* Create background-element for legend. */
const legendBackgound = svg.append("rect")
  .attr("width", width)
  .attr("height", 70)
  .attr("fill", "#eee")
  .attr("transform", `translate(0, ${height - 70})`)

/* Create a group-element for the legend. */
const legend = svg.append("g")

/* Define createMap(). */
async function createMap(selectedmap) {
  
  /* Load and parse data with loadAndParseData(). */
  const municipalities = await loadAndParseData()

  /* Create population map. */
  if (selectedmap == "population") {

    /* Define colorScale. Every map has own colorScale. */
    const colorScale = d3.scaleLinear()
      .domain([-0.05, 0, 0.05])
      .range(["red", "white", "green"])
      
    /* Remove defs element from legend before creating new one. */  
    legend.selectAll("defs")
      .remove()

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
      .data(colorScale.range())
      .enter()
      .append("stop")
      .attr("offset", (d, i) => {
        return i / (colorScale.range().length - 1)
      })
      .attr("stop-color", d => d)
  
    /* Remove rect-elements from legend before creating new one. */
    legend.selectAll("rect")
      .remove()

    /* Create the rect that contains the gradient, referenced by id. */
    legend.append("rect")
      .attr("width", 300)
      .attr("height", 10)
      .style("fill", "url(#linear-gradient)")
      .attr("transform", "translate(25, 560)")
  
    /* Remove all text-elements from legend before creating new ones. */
    legend.selectAll("text")
      .remove()

    /* Append text to legend. */
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
      .text("Muutos prosenteissa vuonna 2021 verrattuna vuoteen 2020.")

    /* Remove all path-elemenst from map before creating new ones. */
    map.selectAll("path")
      .remove()

    /* Append paths to map. */
    map.selectAll("path")
      .data(municipalities)
      .enter()
      .append("path")
      .attr("id", (d) => d.properties.natcode)
      .attr("fill", d => colorScale(d.properties.popchangepercent))
      .attr("class", "municipality")
      .attr("name", (d) => d.properties.namefin)
      .attr("d", path)
      .on("click", showTooltip)

  /* Create economy map. */
  } else if (selectedmap == "economy") {

    legend.selectAll("*")
      .remove()

    map.selectAll("path")
      .remove()

    map.selectAll("path")
      .data(municipalities)
      .enter()
      .append("path")
      .attr("id", d => d.properties.natcode)
      .attr("fill", d => {
        if (d.properties.profitperperson > 0) {
          return "blue"
        } else if (d.properties.profitperperson < 0) {
          return "orange"
        } else {
          return "white"
        }
      })
      .attr("class", "municipality")
      .attr("name", d => d.properties.namefin)
      .attr("d", path)
      .on("click", showTooltip)

    legend.selectAll("rect")
      .data(["blue", "orange", "white"])
      .enter()
      .append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", d => d)
      .attr("transform", (d, i) => {
        return `translate(${i * 120 + 25}, 560)`
      })
      
      legend.selectAll("text")
      .data(["Positiivinen", "Negatiivinen", "Ei tietoa"])
      .enter()
      .append("text")
      .attr("font-size", "0.7rem")
      .attr("font-family", "sans-serif")
      .text(d => d)
      .attr("transform", (d, i) => {
        return `translate(${i * 120 + 40}, 570)`
      })
      
      legend.append("text")
        .attr("transform", "translate(25, 550)")
        .attr("font-size", "0.7rem")
        .attr("font-family", "sans-serif")
        .text("Tilikauden tulos 2021, euroa/kuntalainen.")

  /* Create healthcare map. */
  } else if (selectedmap == "healthcare") {

    const colorScale = d3.scaleLinear()
      .domain([2400, 6800])
      .range(["yellow", "violet"])

    legend.selectAll("defs")
      .remove()
    
    const defs = legend.append("defs")

    const linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%")

    linearGradient.selectAll("stop")
      .data(colorScale.range())
      .enter()
      .append("stop")
      .attr("offset", (d, i) => {
        return i / (colorScale.range().length - 1)
      })
      .attr("stop-color", d => d)

    legend.selectAll("rect")
      .remove()

    legend.append("rect")
      .attr("width", 300)
      .attr("height", 10)
      .style("fill", "url(#linear-gradient)")
      .attr("transform", "translate(25, 560)")

    legend.selectAll("text")
      .remove()

    legend.selectAll("text")
      .data(["2000", "3000", "4000", "5000", "6000", "7000"])
      .enter()
      .append("text")
      .attr("y", 585)
      .attr("x", (d, i) => {
        return `${(i) * 55 + 25}`
      })
      .text(d => d)
      .attr("font-size", "0.7rem")
      .attr("font-family", "sans-serif")
      .attr("opacity", 0.8)

    legend.append("text")
      .attr("transform", "translate(25, 550)")
      .attr("font-size", "0.7rem")
      .attr("font-family", "sans-serif")
      .text("Sote yhteensä vuonna 2020, euroa/kuntalainen.*")

    legend.append("text")
      .attr("transform", "translate(25, 20)")
      .attr("font-size", "0.7rem")
      .attr("font-family", "sans-serif")
      .text("*Pois lukien Ahvenanmaa.")

    map.selectAll("path")
      .remove()

    map.selectAll("path")
    .data(municipalities)
    .enter()
    .append("path")
    .attr("id", d => d.properties.natcode)
    .attr("fill", d => {
      if (d.properties.healthcarecost != undefined) {
        return colorScale(d.properties.healthcarecost)
      } else {
        return "white"
      }
    })
    .attr("class", "municipality")
    .attr("name", d => d.properties.namefin)
    .attr("d", path)
    .on("click", showTooltip)
  }

  /* Call hideTooltip() to hide tooltip when map changes. */
  hideTooltip()
}

/* Select tooltip-element. */
const tooltip = d3.select("#tooltip")

/* Create p-element inside tooltip-div. */
const tooltipNode = document.getElementById("tooltip")
const tooltipNodeElement = document.createElement("p")
tooltipNode.appendChild(tooltipNodeElement)

/* Define showTooltip(). */
function showTooltip(event) {
  
  /* Set opacity on all paths. */
  d3.selectAll("path")
    .style("opacity", 0.4)
    .style("stroke-width", "0.25px")

  /* Select path. */
  const selected = d3.select(this)
  
  /* Set opacity on selected path. */
  selected
    .style("opacity", 1.0)
    .style("stroke-width", "1px")

  /* Access data through selected path. */
  const selectedProperties = selected._groups[0][0].__data__.properties

  /* Get click x and y coordinates. */
  let x = event.clientX
  let y = event.clientY + window.scrollY

  /* Get map border x and y coordinates. Bottom y not needed. */
  const mapLeftBordeX = (window.innerWidth - 350) / 2
  const mapRightBorderX = (window.innerWidth - ((window.innerWidth - 350) / 2))
  const mapTopBorderY = 160 - window.scrollY

  /* Calculate x and y coordinates for map padding.
  Padding is related to tooltip div size (150x70). */
  const xPaddingLeft = mapLeftBordeX + 80
  const xPaddingRight = mapRightBorderX - 80
  const yPaddingTop = mapTopBorderY + 102.5 + window.scrollY
  
  /* Calculate padding for top when window is scrolled. */
  const yPaddingTopScrolled = window.scrollY + 102.5

  /* Use map padding to adjust tooltip x coordinates. */
  if (x < xPaddingLeft) {    
    const adjustX = xPaddingLeft - x
    x = x + adjustX
  } else if (x > xPaddingRight) {
    const adjustX = x - xPaddingRight
    x = x - adjustX
  }

  /* Use map padding to adjust tooltip y coordinates. */
  if (y < yPaddingTop) {
    const adjustY = yPaddingTop - y
    y = y + adjustY
  }
  
  /* Use map padding to adjust tooltip y coordinates
  when map is scrolled past top. */
  if (y < yPaddingTopScrolled) {
    const adjustY = yPaddingTopScrolled - y
    y = y + adjustY
  }

  /* Set visibility on tooltip to visible. Also position. */
  tooltip
    .style("left", d => `${x - 75}px`)
    .style("top", d => `${y - 120}px`)
    .style("visibility", "visible")
    .on("click", hideTooltip)

  /* Set text in tooltip. */
  if (mapSelector == "population") {
    tooltipNodeElement.innerHTML = `<b>${selectedProperties.namefin}</b><br>
      Väestö: ${selectedProperties.popsize}<br>
      Väestönlisäys: ${selectedProperties.popchange}<br>
      Muutos: ${(selectedProperties.popchangepercent * 100).toFixed(2)}%`
  } else if (mapSelector == "economy") {
    tooltipNodeElement.innerHTML = `<b>${selectedProperties.namefin}</b><br>
      Toimintakulut: ${selectedProperties.costperperson}<br>
      Valtionosuudet: ${selectedProperties.statefinancingperperson}<br>
      Tilikauden tulos: ${selectedProperties.profitperperson}`
  } else if (mapSelector == "healthcare") {
    tooltipNodeElement.innerHTML = `<b>${selectedProperties.namefin}</b><br>
      Perusterveydenhoito: ${selectedProperties.basichealthcarecost}<br>
      Erikoissairaanhoito: ${selectedProperties.specialhealthcarecost}<br>
      Sote yhteensä: ${selectedProperties.healthcarecost}`
  }
}

/* Define hideTooltip(). */
function hideTooltip() {

  /* Set styles on all paths to default. */
  d3.selectAll("path")
    .style("opacity", 1)
    .style("stroke-width", "0.25px")

  /* Set visibility on tooltip to hidden. */
  tooltip
    .style("visibility", "hidden")
}

/* Define loadAndParseData(). */
async function loadAndParseData() {

  /* Load geojson-file. */
  const data = await d3.json("kunnat-clipped.geojson")
  const municipalities = data.features

  /* Load population-file. */
  const population = await d3.json("kunnat-vaestonmuutos.json")

  /* Create a lookup table. Using reduce() would be fancier. */
  const populationTable = {}
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
  
  /* Load healthcare-file and create a lookup table for healthcare.
  Same as above, but shorter. */
  const healthcareTable = {}
  const healthcare = await d3.csv("kunnat-terveydenhoito.csv", (data) => {
    const key = data.municipality
    const value1 = parseInt(data.healthcareperperson)
    const value2 = parseInt(data.basichealthcareperperson)
    const value3 = parseInt(data.specialhealthcareperperson)
  
    /* Create entries for healthcareTable. */
    healthcareTable[key] = {
      healthcarecost: value1,
      basichealthcarecost: value2,
      specialhealthcarecost: value3,
    }
  })
  
  /* Assign values in healthcareTable to municipalities. Same as above. */
  municipalities.forEach(d => {
    if (healthcareTable[d.properties.namefin] != undefined) {
      Object.assign(d.properties, healthcareTable[d.properties.namefin])
    }
  })

  /* Load economy-file and parse, as above. */
  const economyTable = {}
  const economy = await d3.csv("kunnat-talous.csv", (data) => {
    const key = data.municipality
    const value1 = parseInt(data.statefinancingperperson)
    const value2 = parseInt(data.profitperperson)
    const value3 = parseInt(data.costperperson)
    
    /* Create entries for economyTable. */
    economyTable[key] = {
      statefinancingperperson: value1,
      profitperperson: value2,
      costperperson: value3,
    }
  })

  /* Assign value in economyTable to municipalities. */
  municipalities.forEach(d => {
    if (economyTable[d.properties.namefin] != undefined) {
      Object.assign(d.properties, economyTable[d.properties.namefin])
    }
  })

  /* Return the parsed object with all the data. */
  return municipalities
}

/* Define zoom. */
const zoom = d3.zoom()
  .scaleExtent([1, 5])
  .translateExtent([[0, 0], [width, height]])
  .on("zoom", handleZoom)

/* Define handleZoom. */
function handleZoom (e) {
  d3.select("g")
    .attr("transform", e.transform)
    .call(hideTooltip)
}

/* Define initZoom. */
function initZoom () {
  d3.select("svg")
    .call(zoom)
}

/* Run initZoom(). */
initZoom()

/* Run createMap(). */
createMap(mapSelector)