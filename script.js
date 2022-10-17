/* Initialize Chart */

/* define margins and container dimensions */
const margin = ({top: 20, right: 20, bottom: 20, left: 20}); 
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

/* create chart container */
const barChart = d3.select('.barChart')
  .append('svg')
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transorm", "translate(" + margin.left + "," + margin.top + ")")

/* define scale for x-axis (no domain) */
const xScale = d3.scaleBand()
  .rangeRound([0, width - 10])
  .paddingInner(0.1)

/* define y axis linear scale (no domain) */
const yScale = d3.scaleLinear()
  .range([height, 30]);

/* add x axis at bottom of chart */
const xAxis = d3.axisBottom()
  .scale(xScale)

/* add y axis at left of chart */
const yAxis = d3.axisLeft()
  .scale(yScale)

/* format x axis */
const xLabels = barChart.append("g")
  .attr("class", "axis xAxis")
  .attr("transform", `translate(50, ${height})`)

/* format y axis */
const yLabels = barChart.append("g")
  .attr("class", "axis yAxis")
  .attr("transform", `translate(${width * 0.066}, 0)`)

/* add y axis header */
const yHeader = barChart.append("text")
  .attr("class", "yHeader")
  .attr("x", width * 0.055)
  .attr("y", height * 0.05)
  .style("text-anchor", "start")

/* Initialize type (to be changed by user) and the sorting direction (to be changed by user) */
let type = d3.select("#group-by").node().value;
let sortingDirection = d3.select("#sortingButton").node().value;


/* Function to update the bar chart based on user selection */
function update(data, type) {

  /* Update Scale Domains */
  xScale.domain(data.map(d => d.company))
  console.log(data[type]);
  
  /* get max number of stores to set y axis limit */
  let extent = d3.extent(data.map(d => d[type]));
  let maxY = extent[1];
  console.log(maxY) 
  
  yScale.domain([0, maxY])
  
  /* Define transition t be 2 seconds and delay to be 0.1 seconds*/
  const t = barChart.transition().duration(2000);
  const slowT = (_,i) => i * 100;
  
  /* Pick bar color based on type */
  let color;
  if (type == "stores") {
    color = "#FF5733"
  } else {
    color = "#50C45C"
  }
  
  /* Update bar chart */
  const bars = barChart.selectAll("rect")
    .data(data, d => d.company);
  
  bars.join(
    enter => enter.append("rect")
      .attr("x", d => 50 + xScale(d.company))
      .attr("y", d => yScale(d[type]))
      .attr("width", xScale.bandwidth)
      .attr("height", d => height - yScale(d[type]))
      .attr("fill", color),  
    update => update.call(update => 
                update.transition(t).delay(slowT)
                  .attr("x", d => 50 + xScale(d.company))
                  .attr("y", d => yScale(d[type]))
                  .attr("height", d => height - yScale(d[type]))
                  .attr("fill", color), //***** change colors?
              ),
    exit => exit.remove()
  );
  
  /* update labels */
  xLabels.transition(t)
    .call(xAxis)
    .call(g => g.selectAll(".tick").delay(slowT));
  
  yLabels.transition(t)
    .call(yAxis);
  
  /* Choose y header based on type selected by user */
  let dynamicHeader;
  if (type == "stores") {
    dynamicHeader = "Number of Stores"
  } else {
    dynamicHeader = "Revenue (Billion USD)"
  }
  
  yHeader.text(dynamicHeader);
  
}


/* Function called to sort the data in the bar chart alternating ascending and descending */
function sortChart(data, type) {
  sortingDirection = d3.select("#sortingButton").node().value * (-1);
  d3.select("#sortingButton").property("value", sortingDirection);
  if (sortingDirection > 0) {
    data.sort((a, b) => a[type] - b[type]);
  } else {
    data.sort((a,b) => b[type] - a[type]);
  }
}


/* Load the data and call update and sort functions on changes/clicks */
d3.csv('coffee-house-chains.csv', d3.autoType).then(data => {
	d3.select("#group-by").on("change", () => {
    type = d3.select("#group-by").node().value
    update(data, type)
  });
  d3.select("#sortingButton").on("click", () => {
    sortChart(data, type)
    update(data, type)
  });
  update(data, type);
});
