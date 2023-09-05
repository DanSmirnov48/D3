const svgWidth = 1000;
const svgHeight = 600;
const margin = { top: 60, right: 20, bottom: 50, left: 80 };
const chartWidth = svgWidth - margin.left - margin.right;
const chartHeight = svgHeight - margin.top - margin.bottom;
const barPadding = 5;

let dates = [];
let values = [];

async function fetchData() {
    try {
        const apiUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';
        const response = await fetch(apiUrl);
        const { data } = await response.json();
        dates = data.map((entry) => entry[0]);
        values = data.map((entry) => entry[1]);
        drawGraph();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

fetchData()

function drawGraph() {

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(values)])
        .range([chartHeight, 0]);

    const xScale = d3.scaleBand()
        .domain(dates)
        .range([0, chartWidth])
        .padding(0.1);

    // const xScale = d3.scaleTime()
    //     .domain(d3.min(dates), d3.max(dates))
    //     .range([0, chartWidth]);

    const svg = d3.select(".graph-container")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top - 10})`);

    const tooltip = d3.select(".tooltip")        
        .attr("id", "tooltip")
        .style("opacity", 0)

    const barChart = chart.selectAll('rect')
        .data(values)
        .enter()
        .append('rect')
        .attr("class", "bar")
        .attr("x", (_, i) => xScale(dates[i]))
        .attr("y", (d) => yScale(d))
        .attr("height", (d) => chartHeight - yScale(d))
        .attr("width", xScale.bandwidth())
        .style("fill", "dodgerblue")
        .attr('data-date', (_, i) => dates[i])
        .attr('data-gdp', (d) => d)
        .on("mouseover", function (d, i) {
            d3.select(this).style("fill", "white");
            const fullDate = dates[i];
            const year = new Date(fullDate).getFullYear();
            const month = new Date(fullDate).getMonth();

            const quarter =
                month <= 2 ? "Q1" :
                    month <= 5 ? "Q2" :
                        month <= 8 ? "Q3" : "Q4";

            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9)
                .attr('data-date', dates[i]);

            var xPos = xScale(dates[i]);
            var yPos = yScale(d);
            
            xPos += margin.left + 50;
            yPos += 150;
                       
            tooltip.html(`${year} ${quarter}<br>$${d.toLocaleString()} Billion`)
                .style("left", `${xPos}px`)
                .style("top", `${450}px`);
        })
        .on("mouseout", function () {
            d3.select(this).style("fill", "dodgerblue");

            tooltip.transition()
                .duration(500)
                .style("opacity", 0)
                .attr("data-date", "");
        });


    const xAxis = d3.axisBottom(xScale)
        .tickValues(dates.filter((date, index) => index % 20 === 0))
        .tickFormat(date => new Date(date).getFullYear());
    chart.append("g")
        .attr("id", "x-axis")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(xAxis)
        .selectAll(".tick text")
        .attr("class", "tick");

    const yAxis = d3.axisLeft(yScale);
    chart.append("g")
        .attr("id", "y-axis")
        .attr("class", "y-axis")
        .call(yAxis)
        .selectAll(".tick text")
        .attr("class", "tick");

    chart.append("text")
        .attr("class", "y-axis-title")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight / 2 + 100)
        .attr("y", -margin.left + 110)
        .style("text-anchor", "middle")
        .text("Gross Domestic Product")
}
