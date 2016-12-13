"use strict";
angular.module('app')
  .controller('populationHealthController', function ($scope,Data,$rootScope) {
    console.log("populationHealthController start!!!");
    $rootScope.pageLoading = true;
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
    $scope.nowCityName = "陕西省";
    $scope.drawProvince = function (url) {
        Data.getSankeyData(url).then(function (res) {
            console.log(res);
            drawMap(res);
        }, function (error) {
            console.log(error);
        });
    };
    $scope.cityDist = null;
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
                                $scope.vm.nowCityName = d.properties.name;
                                setTimeout(function () {
                                    $scope.$apply(function () {
                                        $scope.message = "Timeout called!";
                                    });
                                }, 100);
                                drawCity(d, svg, 2);
                           });

            drawMarker("data/p10000.json", res, svg, shanxi, width, projection, 1);

    }

    function drawMarker(url, datas, svg, shanxi, width, projection, index) {
        datas.features.forEach(function (d,i) {
            d.properties.values = 0;
            var centroid = {};
            centroid.id = d.properties.id;
            centroid.name = d.properties.name;
            centroid.values = d.properties.values;
            $scope.vm.cityNodes.push(centroid);
        });
        Data.getSankeyData(url).then(function (res) {
            var newCityList = [];
            res.forEach (function (d) {
                datas.features.forEach(function (d1) {
                    //console.log(d1);
                    var loclist = null;
                    if (index == 1) {
                        loclist = d1.geometry.coordinates[0];
                    }else if (index == 2) {
                        loclist = d1.geometry.coordinates[0][0];
                    }
                    if (isInside(d, loclist) == true) {
                        $scope.vm.cityNodes.forEach(function (d2) {
                           if (d2.id == d1.properties.id) {
                                d2.values += 1;
                                d.city = d2.name;
                                if (d.prof == null) {
                                      d.prof = "不详"
                                }
                                newCityList.push(d);
                            }
                        });
                        d1.properties.values += 1;
                    }
                });
            });
            drawMapColor(datas, newCityList, svg, shanxi, width, projection);
            $rootScope.pageLoading = false;
        });
    }

    function drawMapColor(datas, res, svg, shanxi, width, projection) {
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
        var maxvalue = d3.max($scope.vm.cityNodes, function (d, i) {
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
            $scope.cityDist.filter(null).filter(d.properties.name)
            .redrawGroup();
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
            $scope.cityDist.filter(null).filter(null)
            .redrawGroup();
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
        cityDim = ndx.dimension(function (d) {
            return d.city;
        }),
        cityGroup = cityDim.group().reduceCount(function (d) {
            return d.city;
        });
        $scope.cityDist = cityDist;
        drawBarCityDist(cityDist, cityDim, cityGroup);
        // draw sex distribution
        var sexDist = dc.pieChart("#sexDist"),
        sexDim = ndx.dimension(function(d) {
            return d.sex;
        }),
        sexGroup = sexDim.group().reduceCount(function (d) {
            return d.sex;
        });
        drawPieSexDist(sexDist, sexDim, sexGroup);
        // blood dist
        var bloodDist = dc.pieChart("#bloodDist"),
        bloodDim = ndx.dimension(function (d) {
            return d.blood;
        }),
        bloodGroup = bloodDim.group().reduceCount(function (d) {
            return d.blood;
        });
        drawPieBloodDist(bloodDist, bloodDim, bloodGroup);
        // draw job dist 
        var jobDist = dc.rowChart("#jobDist"),
        jobDim = ndx.dimension(function (d) {
            return d.prof;
        }),
        jobGroup = jobDim.group().reduceCount(function (d) {
            return d.prof;
        });
        drawBarJobDist(jobDist, jobDim, jobGroup);
        // draw dept dist
        var deptDist = dc.rowChart("#deptDist"),
        deptDim = ndx.dimension(function (d) {
            return d.in_dept;
        }),
        deptGroup = deptDim.group().reduceCount(function (d) {
            return d.in_dept;
        });
        drawBarDeptDist(deptDist, deptDim, deptGroup);
        // age dist
        var ageDist = dc.lineChart("#ageDist"),
        ageDim = ndx.dimension(function (d) {
            return d.age;
        }),
        ageGroup = ageDim.group().reduceCount(function (d) {
            return d.age;
        });
        drawLineAgeDist(ageDist, ageDim, ageGroup);
    }
    function drawBarCityDist(cityDist, cityDim, cityGroup) {
        var width = $("#cityDist").width() * 0.9;
        cityDist.width(width)
        .height(200)
        .margins({top: 10, right: 50, bottom: 30, left: 40})
        .dimension(cityDim)
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

    function drawPieSexDist(sexDist, sexDim, sexGroup) {
        var width = $("#sexDist").width() * 0.9;
        sexDist
            .width($("#sexDist").width() * 0.9)
            .height(200)
            .innerRadius(10)
            .dimension(sexDim)
            .group(sexGroup)
            .legend(dc.legend());
        sexDist.render();
    }

    function drawPieBloodDist(bloodDist, bloodDim, bloodGroup) {
        var width = $("#bloodDist").width() * 0.9;
        bloodDist
            .width($("#bloodDist").width() * 0.9)
            .height(200)
            .innerRadius(10)
            .dimension(bloodDim)
            .group(bloodGroup)
            .legend(dc.legend());
        bloodDist.render();
    }
    function drawBarJobDist(jobDist, jobDim, jobGroup) {
        var width = $("#jobDist").width() * 0.9;
        jobDist.width(width)
        .height(200)
        .dimension(jobDim)
        .group(jobGroup)
        .x(d3.scale.linear().domain([6,20]))
        .elasticX(true);
        jobDist.render();
    }
    function drawBarDeptDist(deptDist, deptDim, deptGroup) {
        var width = $("#deptDist").width() * 0.9;
        deptDist.data = function () {
            var top5 = deptGroup.top(5);
            return top5;
        };
        deptDist.width(width)
        .height(200)
        .dimension(deptDim)
        .group(deptGroup)
        .elasticX(true);
        deptDist.render();
    }
    function drawLineAgeDist(ageDist, ageDim, ageGroup) {
        var width = $("#ageDist").width() * 0.9;
        ageDist.width(width)
               .height(200)
               .x(d3.scale.ordinal())
               .xUnits(dc.units.ordinal)
               .xAxisLabel('年龄')
               .yAxisLabel('次数')
               .dimension(ageDim)
               .group(ageGroup);
        ageDist.render();
    }

    function drawCity(d, svg, index) {
        $("#map svg").html("");
        $scope.vm.cityNodes = [];
        var id = d.properties.id,
        width = $("#map").width(),
        height = 600,
        url = "mapdata/geometryCouties/" + id + "00.json",
        city = svg.append("g")
                  .attr("transform", "translate(0,0)");
        Data.getSankeyData(url).then(function (res) {
            var zoomscale = getZoomScale(res.features, width, height),
            centers = getCenters(res.features),
            projection = d3.geo.mercator()
                               .center(centers)
                               .scale(zoomscale * 35)
                               .translate([width / 2, height / 2]),
            path = d3.geo.path().projection(projection);
            city
            .selectAll(".pathProvince")
            .data(res.features)
            .enter()
            .append("path")
            .attr("class", "pathProvince")
            .attr("stroke", "#000")
            .attr("stroke-width", 0.3)
            .attr("fill", "green")
            .attr("d", path)
            .on("click", function (d,i) {
                $scope.vm.nowCityName = d.properties.name;
                setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.message = "Timeout called!";
                    });
                }, 100);
            });
        drawMarker("data/p10000.json", res, svg, city, width, projection, index);
        });
    }
    //获取中心位置坐标
    function getCenters(features) {
        var longitudeMin = 100000;//最小经度
        var latitudeMin = 100000;//最小维度
        var longitudeMax = 0;//最大经度
        var latitudeMax = 0;//最大纬度
        features.forEach(function (e) {
            var a = d3.geo.bounds(e);//[[最小经度，最小维度][最大经度，最大纬度]]
            if (a[0][0] < longitudeMin) {
                longitudeMin = a[0][0];
            }
            if (a[0][1] < latitudeMin) {
                latitudeMin = a[0][1];
            }
            if (a[1][0] > longitudeMax) {
                longitudeMax = a[1][0];
            }
            if (a[1][1] > latitudeMax) {
                latitudeMax = a[1][1];
            }
        });
        var a = (longitudeMax + longitudeMin) / 2;
        var b = (latitudeMax + latitudeMin) / 2;
        return [a, b];
    }
    // 获取缩放范围
    function getZoomScale(features, width, height) {
        var longitudeMin = 100000;//最小经度
        var latitudeMin = 100000;//最小维度
        var longitudeMax = 0;//最大经度
        var latitudeMax = 0;//最大纬度
        features.forEach(function (e) {  
            var a = d3.geo.bounds(e);//[[最小经度，最小维度][最大经度，最大纬度]]
            if (a[0][0] < longitudeMin) {
                longitudeMin = a[0][0];
            }
            if (a[0][1] < latitudeMin) {
                latitudeMin = a[0][1];
            }
            if (a[1][0] > longitudeMax) {
                longitudeMax = a[1][0];
            }
            if (a[1][1] > latitudeMax) {
                latitudeMax = a[1][1];
            }
        });
        var a = longitudeMax - longitudeMin;
        var b = latitudeMax - latitudeMin;
        return Math.min(width / a, height / b);
    }
});
