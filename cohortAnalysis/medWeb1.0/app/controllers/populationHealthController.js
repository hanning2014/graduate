"use strict";
angular.module('app')
  .controller('populationHealthController', function ($scope,Data,$rootScope) {
    console.log("populationHealthController start!!!");
    $rootScope.pageLoading = false;
    $scope.vm = {};
    $scope.vm.cityNodes = [];
    $scope.vm.items = [
            {
                id: 1,
                name: "门诊量"
            },{
                id: 2,
                name: "住院量"
            },{
                id: 3,
                name: "手术量"
            },{
                id: 4,
                name: "花费量"
            }
    ];
    $scope.vm.totalRec = [];
    $scope.vm.stasLabel = $scope.vm.items[0].name;
    $scope.changeMap = function (names) {
        console.log(names);
        $("#map").html("");
        $scope.vm.cityNodes = [];
        $scope.vm.stasLabel = names;
        drawProvienceMap("mapdata/geometryProvince/61.json");
        setTimeout(function () {
            $scope.$apply(function () {
                $scope.message = "Timeout called!";
            });
        }, 100);
        // $scope.$apply();
    };
    drawProvienceMap("mapdata/geometryProvince/61.json");
    function drawProvienceMap(mapPath) {
        console.log(mapPath);
        var width = $("#map").width(),
        margin = {left: 50, right: 0},
        height = 600;
        var svg = d3.select("#map").append("svg")
        .attr("width", width - margin.left - margin.right)
        .attr("height", height);
        var shanxi = svg.append("g")
        .attr("transform", "translate(0,0)");
        d3.json(mapPath, function (error, root) {
                var projection = d3.geo.mercator()
                .center(root.cp)
                .scale(root.size * 2.7)
                .translate([width / 4 * 2, height / 2]),
                path = d3.geo.path().projection(projection),
                    color = d3.scale.category20(),
                cities = shanxi.selectAll(".pathProvince")
                .data(root.features)
                .enter()
                .append("path")
                .attr("class", "pathProvince")
                .attr("stroke", "#fff")
                .attr("stroke-width", 0.3)
                .attr("fill", function (d,i) {
                    return "midnightblue";
                })
                .attr("d", path);
                //获取中心点坐标
                root.features.forEach(function (d, i) {
                    d.properties.values = parseInt(100 * Math.random());
                    var centroid = {};
                    // centroid.x = centroid[0];
                    // centroid.y = centroid[1];
                    centroid.id = d.properties.id;
                    centroid.name = d.properties.name;
                    //centroid.feature = d;
                    centroid.values = d.properties.values;
                    $scope.vm.cityNodes.push((centroid));
                });
                $scope.vm.totalRec = [];
                $scope.vm.cityNodes.forEach(function (d,i) {
                    var rec = {};
                    rec.id = d.id;
                    rec.name = d.name;
                    rec.values = d.values;
                    $scope.vm.totalRec.push(rec);
                });
                console.log($scope.vm.totalRec);
                drawcityDist($scope.vm.totalRec);
                //add circle
                shanxi.selectAll("circle")
                .data(root.features)
                .enter()
                .append("circle")
                .attr("transform", function (d) {
                    return "translate(" + path.centroid(d) + ")";
                })
                .attr("r", function (d,i) {
                    return Math.pow(d.properties.values, 0.5);
                })
                .attr("fill", function (d,i) {
                    return color(i);
                });
                //获取渐变函数最大值最小值
                var maxvalue = d3.max(root.features, function (d,i) {
                    return d.properties.values;
                }),
                minvalue = d3.min(root.features, function (d,i) {
                    return d.properties.values;
                }),
                linear = d3.scale.linear()
                               .domain([minvalue,maxvalue])
                               .range([0,1]),
                a = d3.rgb(0, 255, 255),
                b = d3.rgb(0, 0, 255),
                computeColor = d3.interpolate(a, b);
                // color update
                shanxi.selectAll(".pathProvince")
                .attr("fill", function (d, i) {
                    var color = computeColor(linear(d.properties.values));
                    return color.toString();
                });
                // add zoom in and zoom out
                var zoom = d3.behavior.zoom()
                    .translate([width / 2, height / 2])
                    .scale(root.size * 2.7)
                    .scaleExtent([root.size * 2.7, 8 * root.size])
                    .on("zoom", zoomed);
                function zoomed() {
                    projection
                    .translate(zoom.translate())
                    .scale(zoom.scale());
                    shanxi.selectAll("path")
                   .attr("d", path);
                    shanxi.selectAll("circle")
                    .attr("transform", function (d) {
                        return "translate(" + path.centroid(d) + ")";
                    })
                    .attr("r", function (d,i) {
                        return Math.pow(d.properties.values, 0.5);
                    });
                }
                shanxi.call(zoom)
                      .call(zoomed);
                //add rect to brush
                var defs = svg.append("defs"),
                linearGradient = defs.append("linearGradient")
                                     .attr("id", "linearcolor")
                                     .attr("x1", "0%")
                                     .attr("y1", "0%")
                                     .attr("x2", "100%")
                                     .attr("y2", "0%"),
                stop1 = linearGradient.append("stop")
                                     .attr("offset", "0%")
                                     .attr("stop-color", a.toString()),
                stop2 = linearGradient.append("stop")
                                 .attr("offset", "100%")
                                 .attr("stop-color", b.toString()),
                 //添加一个矩形，并应用线性渐变
                colorRect = svg.append("rect")
                    .attr("x", width - margin.left - margin.right - 110)
                    .attr("y", 520)
                    .attr("width", 100)
                    .attr("height", 30)
                    .style("fill", "url(#" + linearGradient.attr("id") + ")");
                svg.append("text")
                    .attr("class", "valueText")
                    .attr("x", width - margin.left - margin.right - 110)
                        .attr("y", 520)
                        .attr("dy", "-0.3em")
                        .text(function () {
                            return minvalue;
                        });
                svg.append("text")
                        .attr("class", "valueText")
                        .attr("x", width - margin.left - margin.right - 20)
                        .attr("y", 520)
                        .attr("dy", "-0.3em")
                        .text(function () {
                            return maxvalue;
                        });
            });//end json
    }//end drawMap
    function drawcityDist(datas) {
        datas.forEach(function (d) {
            d.id = +d.id;
            d.values = d.values;
        });
        var ndx = crossfilter(datas);
        var all = ndx.groupAll();
        
        var cityDist = dc.barChart("#cityDist");
        var width = $("#cityDist").width() * 0.9;
        var citys = ndx.dimension(function (d) {
            return d.name;
        });
        var cityGroup = citys.group().reduceSum(function(d){
            return d.values;
        });
        cityDist.width(width)
        .height(200)
        .margins({top: 10, right: 50, bottom: 30, left: 40})
        .dimension(citys)
        .group(cityGroup)
        .elasticY(true)
        .centerBar(false)
        .round(dc.round.floor)
        .alwaysUseRounding(true)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .renderHorizontalGridLines(true)
        .yAxis()
        .ticks(5);
        cityDist.render();


    }
});
