"use strict";
angular.module('app')
  .controller('sankeyController', function ($scope,Data, SPDiagnosisSharedDataService, $interval,$location,$rootScope){
    console.log("sankeyController start!!!");
    $rootScope.pageLoading = false;
    $scope.vm = {};
    $scope.vm.stasAna = [
        {
            allEventNums: 0
        },{
            uniqueEventNums: 0
        },{
            allPatternNums: 0
        },{
            uniquePatternNums: 0
        },{
            levelDepth: 1
        },{
            choosePattern: ""
        }
    ];
    $scope.vm.popularEvents = [];
    $scope.vm.popularSequences = [];
    $scope.vm.level = 1;
    $scope.changeLevel = function (type) {
        $scope.vm.level = type;
        console.log($scope.vm.level);
    }
    var units = "次",
    margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = $("#sankeys").width()  - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom,
    formatNumber = d3.format(",.0f"),
    // zero decimal places
    format = function (d) {
        return formatNumber(d) + " " + units;
    },
    color = d3.scale.category20(),
    // append the svg canvas to the page
    svg = d3.select("#sankeys").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")"),
    // Set the sankey diagram properties
    sankey = d3.sankey(width)
      .nodeWidth(35)
      .nodePadding(10)
      .size([width, height]),
    path = sankey.link();
    Data.getSankeyData("data/L1_S100_P1.json")
    .then(function (json) {
        console.log(json);
        var eventsLists = [];
        json.forEach(function (d,i) {
            if (d.patterns.length == 1) {
                var tt = {};
                tt.patterns = d.patterns[0];
                tt.nums = d.nums;
                $scope.vm.popularEvents.push(tt);
            }else {
                var pp = {};
                pp.patterns = d.patterns.join(" -> ");
                pp.nums = d.nums;
                $scope.vm.popularSequences.push(pp);
            }     
        });
        //console.log($scope.vm.popularEvents);
        //console.log($scope.vm.popularSequences);
        var stv = [];
        for (var ii in json) {
            //if json[ii]["patterns"].length > = 3
            for (var jj = 0; jj < json[ii]["patterns"].length - 1 ; jj++) {
                var event = {};
                event["source"] = json[ii]["patterns"][jj] + "_" + jj;
                event["target"] = json[ii]["patterns"][jj + 1] + "_" + (jj + 1);
                event["value"] = json[ii]["nums"];
                stv.push(event);
            }
            // if (stv.length > 1000) {
            //     break;
            // }
        }
        createSankey(stv);
        //console.log(stv);
    }, function (error) {
        console.log(error);
    });
    // create sankey using d3js
    function createSankey(data) {
        //set up graph in same style as original example but empty
        var graph = {"nodes" : [], "links" : []};
        data.forEach(function (d) {
            graph.nodes.push({ "name": d.source });
            graph.nodes.push({ "name": d.target });
            graph.links.push({ "source": d.source,
                "target": d.target,
                "value": d.value });
        });
        //     graph.nodes = graph.nodes.filter(
        //   function(d) 
        //   {return d.name.charAt(d.name.length - 1) != "_";});
        // graph.links = graph.links.filter(
        //   function(d) {return (d.source.charAt(d.source.length - 1) != "_" 
        //     && d.target.charAt(d.target.length - 1) != "_");});
        // return only the distinct / unique nodes
        graph.nodes = d3.keys(d3.nest()
          .key(function (d) {
                return d.name;
            })
        .map(graph.nodes));

        // loop through each link replacing the text with its index from node
        graph.links.forEach(function (d, i) {
            graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
            graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
        });

        //now loop through each nodes to make nodes an array of objects
        // rather than an array of strings
        graph.nodes.forEach(function (d, i) {
            graph.nodes[i] = { "name": d };
        });
        sankey
            .nodes(graph.nodes)
            .links(graph.links)
            .layout(32);

        // add in the links
        var link = svg.append("g").selectAll(".link")
            .data(graph.links)
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("d", path)
            .style("stroke-width", function (d) {
                //return Math.max(1, d.dy);
                return 2;
            })
            .sort(function (a, b) {
                return b.dy - a.dy;
            });

        // add the link titles
        link.append("title")
            .text(function (d) {
                return d.source.name.substring(0, d.source.name.length - 2) + " → " +
                d.target.name.substring(0, d.target.name.length - 2) + "\n" + format(d.value);
            });

        // add in the nodes
        var node = svg
            .append("g")
            .selectAll(".node")
            .data(graph.nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .call(d3.behavior.drag()
            .origin(function (d) {
                return d;
            })
            .on("dragstart", function () {
                this.parentNode.appendChild(this);
            })
            .on("drag", dragmove));

        // add the rectangles for the nodes
        node.append("rect")
            .attr("height", function (d) {
                return d.dy;
            })
            .attr("width", sankey.nodeWidth())
            .style("fill", function (d) {
                //return color(d.name.substring(0, d.name.length - 2));
                return "#CCCCCC";
            })
            .style("stroke", function (d) {
                return d3.rgb(d.color).darker(2);
            })
            .append("title")
            .text(function (d) {
                return d.name.substring(0, d.name.length - 2) + "\n" + format(d.value);
            });

        // add in the title for the nodes
        node.append("text")
            .attr("x", -6)
            .attr("y", function (d) {
                return d.dy / 2;
            })
            .attr("dy", ".25em")
            .attr("text-anchor", "end")
            .attr("transform", null)
            .text(function (d) {
                return d.name.substring(0, d.name.length - 2).substring(0, 10) + "...";
            })
            .filter(function (d) {
                return d.x < width / 2;
            })
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");

        // the function for moving the nodes
        function dragmove(d) {
            d3.select(this)
                  .attr("transform",
                      "translate(" + d.x + "," + (
                          d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
                       ) + ")");
            sankey.relayout();
            link.attr("d", path);
        }
    }; 
});
