"use strict";
angular.module('app')
  .controller('populationHealthController', function ($scope,Data,$rootScope) {
    console.log("populationHealthController start!!!");
    $rootScope.pageLoading = false;
    $scope.vm = {};
    $scope.vm.cityNodes = [];
    $scope.vm.tableNodes = [];
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
    $scope.nowCityName = "陕西省";
    $scope.drawProvince = function (url) {
        Data.getSankeyData(url).then(function (res) {
            console.log(res);
            drawMap(res);
        }, function (error) {
            console.log(error);
        });
    };
    $scope.drawProvince("mapdata/geometryProvince/61.json");
    function drawMap(res) {
        var width = $("#map").width(),
            height = 600,
            margin = { left: 20 },
            svg = d3.select("#map")
                    .append("svg")
                    .attr("width", width - margin.left)
                    .attr("height", height),
            shanxi = svg.append("g")
                        .attr("transform", "translate(0,0)"),
            projection = d3.geo
                           .mercator()
                           .center(res.cp)
                           .scale(res.size * 2.7)
                           .translate([width / 2, height / 2]),
            path = d3.geo.path().projection(projection),
            color = d3.scale.category20(),
            cities = shanxi.selectAll(".pathProvince")
                           .data(res.features)
                           .enter()
                           .append("path")
                           .attr("class", "pathProvince")
                           .attr("stroke", "#fff")
                           .attr("fill", "midnightblue")
                           .attr("d", path)
                           .on("click", function (d, i) {
                                $scope.vm.nowCityName = d.properities.name;
                                setTimeout(function () {
                                    $scope.$apply(function () {
                                        $scope.message = "Timeout called!";
                                    });
                                }, 100);
                           });

            drawMarker("data/popu.json", res, svg, shanxi, width, projection);

    }

    function drawMarker(url, datas, svg, shanxi, width, projection) {
        datas.features.forEach(function (d,i) {
            d.properties.values = 0;
            var centroid = {};
            centroid.id = d.properties.id;
            centroid.name = d.properties.name;
            centroid.values = d.properties.values;
            $scope.vm.cityNodes.push(centroid);
            $scope.vm.tableNodes.push(centroid);
        });
        Data.getSankeyData(url).then(function (res) {
            res.forEach (function (d) {
                datas.features.forEach(function (d1) {
                    //console.log(d1);
                    if (isInside(d, d1.geometry.coordinates[0]) == true) {
                        //console.log(d1);
                        $scope.vm.cityNodes.forEach(function (d2) {
                           if (d2.id == d1.properties.id) {
                                d2.values += 1;
                                d.city = d2.name;
                            }
                        });
                        $scope.vm.tableNodes.forEach(function (d2) {
                            if (d2.id == d1.properties.id) {
                                d2.values += 1;
                            }
                        });
                        d1.properties.values += 1;
                    }
                });
            });
            drawMapColor(datas, res, svg, shanxi, width, projection);

        });
    }

    function drawMapColor (datas, res, svg, shanxi, width, projection) {
        var loc = shanxi.selectAll(".loc")
                        .data(res)
                        .enter()
                        .append("g")
                        .attr("class", "loc")
                        .attr("transform", function (d) {
                            var lnla = [];
                            lnla.push(d.lng);
                            lnla.push(d.lat);
                            var coor = projection(lnla);
                            return "translate(" + coor[0] + "," + coor[1] + ")";
                        });
        loc.append("circle")
           .attr("r", 4);
        // draw color
        var maxvalue = d3.max($scope.vm.cityNodes, function(d, i) {
            return d.values;
        }),
        minvalue = d3.min($scope.vm.cityNodes, function (d,i) {
            return d.values;
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
        })
        .on("mouseover", function (d,i) {
            d3.select(this).attr("fill", "red");
            $scope.vm.hoverCityName = d.properties.name;
            setTimeout(function () {
                $scope.$apply(function () {
                    $scope.message = "Timeout called!";
                });
            }, 100);
        })
        .on("mouseout", function (d,i) {
            var color = computeColor(linear(d.properties.values));
            d3.select(this).attr("fill", color.toString());
            $scope.vm.hoverCityName = "";
            setTimeout(function () {
                $scope.$apply(function () {
                    $scope.message = "Timeout called!";
                });
            }, 100);
        });
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
        //tra = svg.append("g"),
        colorRect = svg.append("rect")
            .attr("x", width - 20 - 110)
            .attr("y", 520)
            .attr("width", 100)
            .attr("height", 30)
            .style("fill", "url(#" + linearGradient.attr("id") + ")");
        svg.append("text")
            .attr("class", "valueText")
            .attr("x", width - 20 - 110)
                .attr("y", 520)
                .attr("dy", "-0.3em")
                .text(function () {
                    return minvalue;
                });
        svg.append("text")
                .attr("class", "valueText")
                .attr("x", width - 20 - 20)
                .attr("y", 520)
                .attr("dy", "-0.3em")
                .text(function () {
                    return maxvalue;
                });
        drawChart(res);
    }

    function isInside(p, city) {
        //console.log(p, city);
        var len = city.length,
        res = false;
        if (len < 3) {
            return false;
        }
        for (var ii = 0, jj = len - 1; ii < len; ii++) {
            var p1 = city[ii],
            p2 = city[jj];
            if (p1[1] < p.lat && p2[1] >= p.lat || p2[1] < p.lat && p1[1] >= p.lat) {
                if (p1[0] + (p.lat - p1[1]) / (p2[1] - p1[1]) * (p2[0] - p1[0]) < p.lng) {
                    res = !res;
                }
            }
            jj = ii;
        }
        return res;
    }

    function drawChart(res) {
        console.log(res);
        var ndx = crossfilter(res),
        all = ndx.groupAll(),
        cityDist = dc.barChart("#cityDist"),
        citiesDim = ndx.dimension( function (d) {
            return d.city;
        })
    }
    function drawBarCityDist() {

    }

    function drawPieSexDist() {

    }

    function drawPieBloodDist() {

    }
    function drawBarJobDist() {

    }
    function drawBarDeptDist() {

    }
});
