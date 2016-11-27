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
    $scope.vm.nowCityName = "陕西省";
    $scope.vm.hoverCityName = "";
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
    var margin = {left: 50, right: 0};
    drawProvienceMap("mapdata/geometryProvince/61.json");
    function drawProvienceMap(mapPath) {
        console.log(mapPath);
        var width = $("#map").width(),
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
                .attr("d", path)
                .on("mouseover", function (d,i) {
                    d3.select(this).attr("fill", "red");
                    console.log(d.properties.name);
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
                })
                .on("click", function (d,i) {
                    $scope.vm.nowCityName = d.properties.name;
                    setTimeout(function () {
                        $scope.$apply(function () {
                            $scope.message = "Timeout called!";
                        });
                    }, 100);
                    clickCities(d, svg);
                });

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
                //tra = svg.append("g"),
                colorRect = svg.append("rect")
                    .attr("x", width - margin.left - margin.right - 110)
                    .attr("y", 520)
                    .attr("width", 100)
                    .attr("height", 30)
                    .style("fill", "url(#" + linearGradient.attr("id") + ")"),
                symbol = d3.svg.symbol()
                    .type(function () {
                        return d3.svg.symbolTypes[4];
                    });
                var x = d3.scale.linear()
                    .domain([minvalue,maxvalue])
                    .range([0,100]);
                var y = d3.scale.linear()
                    .domain([30,30])
                    .range([30,30]);
                svg.append("g")
                    .attr("class", "brush")
                    .attr("transform", "translate(567,520)")
                    .call(
                        d3.svg.brush()
                            .x(x)
                            //.y(y)
                            .on("brushstart", brushstart)
                            .on("brush", brush)
                            .on("brushend", brushend)
                    );
                function brushstart() {
                    console.log("start");
                }
                function brush() {
                    console.log("brush");
                }
               function brushend() {
                    console.log("brushend");
                }
                svg.append("path")
                    .attr("class", "symbol")
                    .attr("transform", function (d) {
                        return "translate(" + (width - margin.left - margin.right - 110) + "," +
                        520 + ")";
                    })
                    .attr("d", symbol)
                    .attr("stroke", a.toString())
                    .attr("stroke-width", 2)
                    .attr("fill", a.toString());
                    
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
        console.log(datas);
        var ndx = crossfilter(datas);
        var all = ndx.groupAll();
        // draw city dist
        $("#cityDist").html("");
        var cityDist = dc.barChart("#cityDist");
        var width = $("#cityDist").width() * 0.9;
        var citys = ndx.dimension(function (d) {
            return d.name;
        });
        var cityGroup = citys.group().reduceSum(function (d) {
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
        drawSexDis(ndx, datas);
    }
    //draw sex dis
    function drawSexDis(ndx, datas) {
        datas.forEach(function (d) {
            var ss = Math.random();
            if (ss > 0.5) {
                d.sex = "男";
            }else {
                d.sex = "女";
            }
        });
        // draw sex dis
        $("#sexDist").html("");
        var sexDis = dc.pieChart("#sexDist"),
        sexDim = ndx.dimension(function (d) {
            return d.sex;
        }),
        sexDimGroup = sexDim.group();
        // sex dis 
        sexDis
            .width($("#sexDist").width() * 0.9)
            .height(200)
            .innerRadius(10)
            .dimension(sexDim)
            .group(sexDimGroup)
            .legend(dc.legend());
        sexDis.render();
        drawAgeDist(ndx, datas);
    }
    // draw ageDist
    function drawAgeDist(ndx,datas) {
        datas.forEach(function (d) {
            d.age = parseInt(Math.random() * 100);
        });
        //console.log(datas);
        $("#ageDist").html("");
        var ageDist = dc.rowChart("#ageDist"),
        ageDim = ndx.dimension(function (d) {
            return d.age;
        }),
        ageDimGroup = ageDim.group();
        ageDist
            .width($("#ageDist").width() * 0.9)
            .height(200)
            .x(d3.scale.linear().domain([6,20]))
            .elasticX(true)
            .dimension(ageDim)
            .group(ageDimGroup)
            .title(function (p) {
                return [
                    "年龄:" + p.key,
                    "次数:" + p.value
                ].join("\n");
            });
        ageDist.render();
    }
    // 点击某个市
    function clickCities(d, svg) {
        console.log(d);
        $("#map svg").html("");
        var id = d.properties.id,
        width = $("#map").width(),
        height = 600,
        mapPath = "mapdata/geometryCouties/" + id + "00.json",
        shanxi = svg.append("g")
        .attr("transform", "translate(0,0)");
        d3.json(mapPath, function (error, root) {
            console.log(root);
            var zoomScale = getZoomScale(root.features, width, height),
            centers = getCenters(root.features),
            projection = d3.geo.mercator()
                .center(centers)
                .scale(zoomScale * 35)
                .translate([width / 4 * 2, height / 2]),
            path = d3.geo.path().projection(projection);
            shanxi
            .selectAll(".pathCouty")
            .data(root.features)
            .enter()
            .append("path")
            .attr("class", "pathCouty")
            .attr("stroke", "#000")
            .attr("stroke-width", 0.3)
            .attr("fill", "green")
            .attr("d", path)
            .on("mouseover", function (d,i) {
                    d3.select(this).attr("fill", "red");
                    console.log(d.properties.name);
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
            })
            .on("click", function (d,i) {
                //$scope.vm.nowCityName = d.properties.name;
                setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.message = "Timeout called!";
                    });
                }, 100);
                //clickCities(d, svg);
            });

            //获取中心点坐标
            $scope.vm.cityNodes = [];
            root.features.forEach(function (d, i) {
                d.properties.values = parseInt(100 * Math.random());
                var centroid = {};
                centroid.id = d.properties.id;
                centroid.name = d.properties.name;
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
            //console.log($scope.vm.totalRec);
            drawcityDist($scope.vm.totalRec);
            //add circle
            shanxi.selectAll("circle")
            .data(root.features)
            .enter()
            .append("circle")
            .attr("transform", function (d) {
                //console.log(path.centroid(d));
                return "translate(" + path.centroid(d) + ")";
            })
            .attr("r", function (d,i) {
                return Math.pow(d.properties.values, 0.5);
            })
            .attr("fill", function (d,i) {
                return "black";
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
            shanxi.selectAll(".pathCouty")
            .attr("fill", function (d, i) {
                var color = computeColor(linear(d.properties.values));
                return color.toString();
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
        });
    }
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
