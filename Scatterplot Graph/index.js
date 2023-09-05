async function fetchData() {
  try {
    const apiUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
    const response = await fetch(apiUrl);
    const data = await response.json();

    const dataArray = data.map((element) => {
      return {
        Time: element.Time,
        Place: element.Place,
        Seconds: element.Seconds,
        Name: element.Name,
        Year: element.Year,
        Nationality: element.Nationality,
        Doping: element.Doping
      };
    });
    drawGraph(dataArray);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

fetchData()

function drawGraph(dataArray) {

  const margin = { top: 40, right: 60, bottom: 80, left: 60 };
  const width = 1000 - margin.left - margin.right;
  const height = 700 - margin.top - margin.bottom;


  const svg = d3.select("#scatterplot-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right + 200)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);


  const xScale = d3.scaleTime()
    .domain([new Date(1994 - 1, 0), new Date(2016, 0)])
    .range([0, width]);

  const timeParser = d3.timeParse("%M:%S");

  const yScale = d3.scaleTime()
    .domain([
      d3.min(dataArray, (d) => timeParser(d.Time)),
      d3.max(dataArray, (d) => timeParser(d.Time)),
    ])
    .range([0, height]);

  const xAxis = d3.axisBottom(xScale)
    .tickValues(xScale.ticks(d3.timeYear.every(2)))
    .tickFormat(d3.timeFormat("%Y"));

  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d3
    .timeFormat("%M:%S"));

  svg.append("g")
    .attr("class", "x-axis")
    .attr("id", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

  svg.append("g")
    .attr("id", "y-axis")
    .attr("class", "y-axis")
    .call(yAxis);

  const tooltip = d3
    .select("#scatterplot-container")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")
    .style("opacity", 0);


  svg.selectAll(".dot")
    .data(dataArray)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d) => xScale(new Date(d.Year, 0)))
    .attr("cy", (d) => yScale(timeParser(d.Time)))
    .attr("r", 6)
    .style("fill", (d) => (d.Doping ? "blue" : "orange"))
    .style("stroke", "black")
    .style("stroke-width", 1)
    .attr("data-xvalue", (d) => new Date(d.Year, 0))
    .attr("data-yvalue", (d) => timeParser(d.Time))
    .on("mouseover", showTooltip)
    .on("mouseout", hideTooltip);


  function showTooltip(d) {
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip.html(
      `
        ${d.Name} : ${d.Nationality}<br>
        Year: ${d.Year}, Time: ${d.Time}
        ${d.Doping ? "<br><br>" + d.Doping : ""}
      `
    )
      .style("left", d3.event.pageX + 15 + "px")
      .style("top", d3.event.pageY - 35 + "px");
    
    tooltip.attr("data-year", d3.select(this).attr("data-xvalue"));
  }
  function hideTooltip() {
    tooltip.transition().duration(500).style("opacity", 0);
  }

  d3.select("#legend")
    .append("span")
    .attr("class", "legend-text")
    .text("35 Fastest times up Alpe d'Huez");

  svg.append("text")
    .attr("class", "y-label")
    .attr("x", -height / 3)
    .attr("y", -margin.left - 5)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .style("font-size", "17px")
    .style("font-weight", "600")
    .text("Time in Minutes");


  const colorIndicatorWidth = 20;
  const colorIndicatorHeight = 20;
  const colorIndicatorSpacing = 10;
  const middleY = height / 2 - colorIndicatorHeight / 2;
  const textOffset = 5;


  svg.append("text")
    .attr("x", width + margin.right - 70 + colorIndicatorWidth + textOffset)
    .attr("y", middleY + colorIndicatorHeight / 2)
    .attr("dy", "0.5em")
    .attr("text-anchor", "end")
    .style("font-size", "12px")
    .text("No doping allegations");


  svg.append("text")
    .attr("x", width + margin.right - 70 + colorIndicatorWidth + textOffset)
    .attr("y", middleY + colorIndicatorHeight * 1.5 + colorIndicatorSpacing)
    .attr("text-anchor", "end")
    .style("font-size", "12px")
    .text("Riders with doping allegations");


  svg.append("rect")
    .attr("x", width + margin.right - 50 + colorIndicatorWidth / 2)
    .attr("y", middleY)
    .attr("width", colorIndicatorWidth)
    .attr("height", colorIndicatorHeight)
    .style("fill", "orange");


  svg.append("rect")
    .attr("x", width + margin.right - 50 + colorIndicatorWidth / 2)
    .attr("y", middleY + colorIndicatorHeight + colorIndicatorSpacing)
    .attr("width", colorIndicatorWidth)
    .attr("height", colorIndicatorHeight)
    .style("fill", "blue");
}
