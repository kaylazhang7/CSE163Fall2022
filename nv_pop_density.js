var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// button for change the displayed color of legend
var currC = d3.schemeOrRd[9];
var C1 = d3.schemeOrRd[9];
var C2 = d3.schemeGnBu[9];

CMap();
    
var colorB = d3.select("body")
    .append("button")
    .text("Different Color!")
    .on("click", function() {
        currC = (currC === C1) ? C2 : C1;
        CMap();
    });

// Button for variation where the visualization will toggle (display or not display) county boundaries
var projection = d3.geoAlbersUsa()
    .scale(3000)
    .translate([width * 1.2, height / 1.5]);
var path = d3.geoPath()
    .projection(projection);
var currT = path;
var toggleButton = d3.select("body")
    .append("button")
    .text("Toggle County Boundary")
    .on("click", function() {
        currT = (currT === path) ? null : path;
        CMap();
    });
        
function CMap() {
    // Get rip of everything inside the svg before creating a new map
    svg.html(null);
    
    // Legend    
    // var path = d3.geoPath();
    var color = d3.scaleThreshold()
    //    .domain([1, 10, 50, 200, 500, 1000, 2000, 4000])
        .domain([1, 5, 10, 20, 50, 100, 300, 400])
    //    .range(d3.schemeOrRd[9]);
    //    .range(d3.schemeGnBu[9]);
        .range(currC);

    var x = d3.scaleSqrt()
    //    .domain([0, 4500])
        .domain([0, 500])
        .rangeRound([440, 950]);

    var g = svg.append("g")
        .attr("class", "key")
        .attr("transform", "translate(0,40)");

    g.selectAll("rect")
      .data(color.range().map(function(d) {
          d = color.invertExtent(d);
          if (d[0] == null) d[0] = x.domain()[0];
          if (d[1] == null) d[1] = x.domain()[1];
          return d;
        }))
      .enter().append("rect")
        .attr("height", 8)
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", function(d) { return x(d[1]) - x(d[0]); })
        .attr("fill", function(d) { return color(d[0]); });

    g.append("text")
        .attr("class", "caption")
        .attr("x", x.range()[0])
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Population per square mile");

    g.call(d3.axisBottom(x)
        .tickSize(13)
        .tickValues(color.domain()))
      .select(".domain")
        .remove();



    var rateById = d3.map();

    //var quantize = d3.scaleQuantize()
    //    .domain([0, 0.15])
    //    .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

    var projection = d3.geoAlbersUsa()
        .scale(3000)
        .translate([width * 1.2, height / 1.5]);
    //    .scale(1280);
    //    .rotation(10)
    //    .translate([width / 2, height / 2]);


    var path = d3.geoPath()
        .projection(projection);

        
    d3.queue()
        // .defer(d3.json, "us-10m.json")
        .defer(d3.json, "nv-topo.json")
        // .defer(d3.tsv, "unemployment.tsv", function(d) { rateById.set(d.id, +d.rate); })
        // .defer(d3.csv,"Population_Density_By_County.csv", function(d) { rateById.set(d.id, +d.Density_per_square_mile_of_land_area); })
        .defer(d3.tsv, "Pop_Density_By_County.tsv", function(d) { rateById.set(d.id, +d.density); }) // Read the Pop_Density_By_County data, the density divid by 100. 
        .await(ready);

    function ready(error, us) {
        //Define Tooltip here
        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
        
        if (error) throw error;

            svg.append("g")
                .attr("class", "counties")
                .selectAll("path")
                .data(topojson.feature(us, us.objects.counties).features)
                .enter().append("path")
                .attr("fill", function(d){ 
                //            console.log(d)
                //        console.log("color:", color(rateById.get(d.properties.GEOID)))
                    return color(rateById.get(d.properties.GEOID)); })
                .attr("d", path)

            // Display information associated with a county 
            .on("mouseover", function(d) { 
                var printText = "County Name : " + d.properties.NAME.toString()
                tooltip.style("opacity", 1)
                    .html(printText)
                    .style("left", (d3.event.pageX-25) + "px")
                    .style("top", (d3.event.pageY-75) + "px")
            })
            .on("mouseout", function(d) {
                tooltip.style("opacity", 0)
            })
        
        
            // Draw lines to separate the countries
            svg.append("path")
                  .datum(topojson.mesh(us, us.objects.counties, function(a, b) {
                  return a !== b; }))
                  .attr("class", "county")
                //          .attr("d", path);
                  .attr("d", currT)
    }
}