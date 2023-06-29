const dataBase = "exp_1.csv"

const colorMap = {
  "Coffee": "rgb(143, 210, 50)", 
  "Food": "rgb(143, 210, 164)", 
  "Home": "rgb(249, 148, 86)", 
  "Transport": "rgb(232, 246, 164)", 
  "Savings": "rgb(66, 136, 181)", 
  "Lifestyle": "rgb(254, 229, 50)", 
  "Other": "rgb(209, 60, 75)", 
};

const ext_margin = {top: 20, right: 20, bottom: 30, left: 40};

let currentState = "value";  // this is our state variable, it can be "value" or "co"

function _1(md){return(
  md``
  )}
  
  function renderChart(data, metric, d3, outerRadius, radiusScale, arc, pie, color, svg, tooltip) {
    svg.selectAll('*').remove();  // clear the SVG

    /////////////////////////////// Define the gradient ////////////////////
    // Define the gradient
    const grad = svg.append("defs")
    .selectAll("linearGradient")
    .data(pie(data))
    .join("linearGradient")
      .attr("id", d => d.data.name + "-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", d => arc.centroid(d)[0] * 1.5)
      .attr("y2", d => arc.centroid(d)[1] * 1.5);

    // Define the gradient colors
    grad.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", d => colorMap[d.data.name]);  // Use color from colorMap for start color

    grad.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "Black");  // Keep end color as darkgrey
    //////////////////////////////// 
  
    const arcs = svg.append("g")
      .selectAll()
      .data(pie(data))
      .join("path")
        .attr("fill", d => colorMap[d.data.name])  // Normal colors here
        // .attr("fill", d => "url(#" + d.data.name + "-gradient)")  // Use gradient here
        .attr("d", arc)
      .on("mouseover", (event, d) => {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(d.data.name + "<br/>" + d.data[currentState])  // Adjusted to use currentState
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mousemove", (event, d) => {
        tooltip
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", (event, d) => {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

      // svg.append("g")
      // .selectAll()
      // .data(pie(data))
      // .join("text")
      //   .attr("transform", d => `translate(${arc.centroid(d)})`)
      //   .call(text => text.append("tspan")
      //       .attr("y", "-0.4em")
      //       .attr("font-weight", "bold")
      //       .attr("text-anchor", "middle")
      //       .text(d => d.data.name));
  
    // calculate the sum of all d.value & d.co
    const sum_money = data.reduce((a, b) => a + b.value, 0).toFixed(2);
    const sum_co = data.reduce((a, b) => a + b.co, 0).toFixed(2);
  
    svg.append("text")
        .attr("font-family", "sans-serif")
        .attr("x", 0)             
        .attr("y", 0)  
        .attr("text-anchor", "middle")
        .style("font-size", "40px") 
        .style("font-weight", "bold")
        .text(currentState === "value" ? `${sum_money}` : `${sum_co}`)  // Adjusted to use currentState
        .append("tspan")  
        .style("font-size", "10px")
        .attr("x", 0)
        .attr("dy", "-4em") 
        .text(`Total ${currentState === "value" ? "Pounds" : "Emissions"} this month`).append("tspan");  // Adjusted to use currentState

    ////////////////////////// Create a Gradient over the graph/////////////////////

    // const gradientOverlay = svg.append("defs")
    // .append("radialGradient")
    // .attr("id", "radial-gradient-overlay");
    
    // gradientOverlay.append("stop")
    //     .attr("offset", "0%")
    //     .attr("stop-color", "#000")
    //     .attr("stop-opacity", 0);
    
    // gradientOverlay.append("stop")
    //     .attr("offset", "20%")
    //     .attr("stop-color", "#000")
    //     .attr("stop-opacity", 1);
    
    // // Create an overlay circle with the gradient
    // svg.append("circle")
    //     .attr("cx", 0)
    //     .attr("cy", 0)
    //     .attr("r", outerRadius * 10)
    //     .style("fill", "url(#radial-gradient-overlay)");
  }
  
  ////////////////////////////////////////////// Chart Display Starts here. //////////////////////////////////////////

  function renderBarChart(data, d3, colorMap, width, height) {
    // Define the dimensions for the chart
    const margin = {top: 20, right: 20, bottom: 30, left: 40},
          barChartWidth = width - margin.left - margin.right,
          barChartHeight = height/2 - margin.top - margin.bottom;

    // Create the SVG for the bar chart
    const svg = d3.select('#linear-chart-container').append('svg')
        .attr('width', barChartWidth + margin.left + margin.right)
        .attr('height', barChartHeight + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define the scales
    const y = d3.scaleBand().rangeRound([0, barChartHeight]).padding(0.1),
          x = d3.scaleLinear().rangeRound([0, barChartWidth]);

    // Compute the sum for each name
    let sums = {};
    data.forEach(d => {
        if (!(d.name in sums)) {
            sums[d.name] = 0;
        }
        sums[d.name] += d.value;
    });

    // Convert the sums to an array of objects
    let sumData = Object.keys(sums).map(name => ({name: name, sum: sums[name]}));

    // Set the domains for the scales
    y.domain(sumData.map(d => d.name));
    x.domain([0, d3.max(sumData, d => d.sum)]);

    // Add the x-axis
    // svg.append('g')
    //     .attr('transform', `translate(0,${barChartHeight})`)
    //     .call(d3.axisBottom(x).ticks(10));

    // Add the y-axis
    // svg.append('g')
    //     .call(d3.axisLeft(y));

    const roundBar = y.bandwidth()/2
    // Add the bars
    svg.selectAll('.bar')
        .data(sumData)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('y', d => y(d.name))
        .attr('x', 0)
        .attr('height', y.bandwidth())
        .attr('width', d => x(d.sum))
        .attr('fill', d => colorMap[d.name])
        .attr("rx", roundBar) // Rounded corners with radius of 5px
        .attr("ry", roundBar);

    svg.append("g")
          .selectAll()
          .data(sumData)
          .join("text")
          .attr("x", d => x(0) + 20)  // position 10px to the left of the bar start
          .attr("y", d => y(d.name) + y.bandwidth() / 2)  // vertically center in the bar
          .attr("text-anchor", "front")  // right align text
          .attr("dominant-baseline", "central")  // vertically center text
          .attr("font-weight", "bold")
          .attr("font-family", "sans-serif")
          .text(d => d.name);
}

  function _chart(width,d3,data){
    const height = Math.min(width, 800);
    const outerRadius = Math.min(width, height) / 2;
    const innerRadius = outerRadius / 2;  // Adjust as needed
    const iOuterRadius = outerRadius * 0.5;
    
    renderBarChart(data, d3, colorMap, width, height);
    // This is the container of the button to change the graph
    d3.select('#button-container')
    .append("button")
    .text(currentState === "value" ? "CO2 Emissions" : "Expenses")
    .on("click", function() {
        // Toggle the current state
        currentState = currentState === "value" ? "co" : "value";
  
        // Update the button text
        d3.select(this).text(currentState === "value" ? "CO2 Emissions" : "Expenses");
  
        // Update the chart
        updateChart();
    });
  
    function updateChart() {
      // Update the pie and arc generators
      pie.value(d => d[currentState]);
      arc.outerRadius(d => radiusScale(d.data[currentState]));
  
      // Re-render the chart
      renderChart(data, currentState, d3, outerRadius, radiusScale, arc, pie, color, svg, tooltip);
    }
  
    const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  
    let values = data.map(d => d.co);
    values.sort((a, b) => b - a); // Descending order
    let secondMax = values[1];  // second maximum value

    const radiusScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.co), secondMax])
    .range([iOuterRadius + 10, outerRadius]);

    // // Scale to map data values to radii
    // const radiusScale = d3.scaleLinear()
    // .domain([d3.min(data, d => d.co), d3.max(data, d => d.co)])
    // .range([iOuterRadius + 10, outerRadius]);
  
    const arc = d3.arc()
    .innerRadius(iOuterRadius)
    .outerRadius(d => {
        const coRadius = radiusScale(d.data.co);
        return coRadius;
    });
    
    arc.cornerRadius(50);
  
    const pie = d3.pie()
        .padAngle(1 / outerRadius)
        .sort(null)
        .value(d => d.value);
  
    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.name))
        .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse());
    
    // log colors
    //data.forEach(d => console.log(d.name + ": " + color(d.name)));
  
    const svg = d3.select("#chart-container").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("style", "max-width: 100%; height: auto;");
    
    renderChart(data, currentState, d3, outerRadius, radiusScale, arc, pie, color, svg, tooltip);

    function downloadSVG() {
      let svgNode = d3.select("svg").node();
      let serializer = new XMLSerializer();
      let svgText = serializer.serializeToString(svgNode);
    
      let svgBlob = new Blob([svgText], {type: "image/svg+xml;charset=utf-8"});
      let svgUrl = URL.createObjectURL(svgBlob);
    
      let downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = "newesttree.svg";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  
    d3.select('body').append('button')
    .text('Download SVG')
    .on('click', downloadSVG);
      
    return svg.node();
  }
  
  function _data(FileAttachment){return(
    FileAttachment(dataBase).csv({typed: true})
    )}  
  
  export default function define(runtime, observer) {
    const main = runtime.module();
    function toString() { return this.url; }
    const fileAttachments = new Map([
                                    [dataBase, {url: new URL(`./files/${dataBase}`, import.meta.url), mimeType: "text/csv", toString}]
                                    ]);
    main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
    // main.variable(observer()).define(["md"], _1);
    main.variable(observer("chart")).define("chart", ["width","d3","data"], _chart);
    main.variable(observer("data")).define("data", ["FileAttachment"], _data);
    return main;
  }

//   // Load the data and then create the charts.
// d3.csv(dataBase).then(data => {
//   // Parse CSV data into appropriate types (d3.csv() returns all fields as strings)
//   data.forEach(d => {
//     d.value = +d.value;
//     d.co = +d.co;
//   });
  
//   const width = 600; // Replace this with the actual width
//   const chartContainer = _chart(width, d3, data); // assuming _chart is your function that creates the chart
// });
  