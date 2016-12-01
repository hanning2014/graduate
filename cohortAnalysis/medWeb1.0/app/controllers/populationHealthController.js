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
        //console.log(mapPath);
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
                .translate([width / 2, height / 2]),
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
                .on("click", function (d,i) {
                    $scope.vm.nowCityName = d.properties.name;
                    setTimeout(function () {
                        $scope.$apply(function () {
                            $scope.message = "Timeout called!";
                        });
                    }, 100);
                    clickCities(d, svg);
                });

                //add marker 
                d3.json("data/popu50000.json", function (error, popu) {
                    console.log("popu", popu);
                     //获取中心点坐标
                    root.features.forEach(function (d, i) {
                        d.properties.values = 0;
                        var centroid = {};
                        centroid.id = d.properties.id;
                        centroid.name = d.properties.name;
                        //centroid.feature = d;
                        centroid.values = d.properties.values;
                        centroid.sex = "男";
                        centroid.sexNum = 0;
                        centroid.age = 0;
                        $scope.vm.cityNodes.push(centroid);
                    });

                    root.features.forEach(function (d, i) {
                        d.properties.values = 0;
                        var centroid = {};
                        centroid.id = d.properties.id;
                        centroid.name = d.properties.name;
                        //centroid.feature = d;
                        centroid.values = d.properties.values;
                        centroid.sex = "女";
                        centroid.sexNum = 0;
                        centroid.age = 0;
                        $scope.vm.cityNodes.push(centroid);
                    });
                    root.features.forEach(function (d, i) {
                        d.properties.values = 0;
                        var centroid = {};
                        centroid.id = d.properties.id;
                        centroid.name = d.properties.name;
                        centroid.values = d.properties.values;
                        $scope.vm.tableNodes.push(centroid);
                    });
                    popu.forEach(function (d,i) {
                        root.features.forEach(function (d1,i1) {
                            //console.log(d.properties.name, d3.geo.bounds(d1));
                            if (d.lng >= d3.geo.bounds(d1)[0][0] &&
                                d.lng <= d3.geo.bounds(d1)[1][0] &&
                                d.lat >= d3.geo.bounds(d1)[0][1] &&
                                d.lat <= d3.geo.bounds(d1)[1][1]) {
                                    //console.log(d1.properties.name);
                                    $scope.vm.cityNodes.forEach(function (d2, i2) {
                                        //console.log(d2);
                                        if (d2.id === d1.properties.id) {
                                            if (d.sex === d2.sex) {
                                                d2.sexNum += 1;
                                                d2.values = d2.values + 1;
                                            }
                                        }
                                    });
                                     //console.log(d1.properties.name);
                                    $scope.vm.tableNodes.forEach(function (d2, i2) {
                                        if (d2.id === d1.properties.id) {
                                            d2.values = d2.values + 1;
                                        }
                                    });
                                    d1.properties.values = d1.properties.values + 1;
                            }
                        });
                    });
                    console.log($scope.vm.cityNodes);
                    var cityDist = drawcityDist($scope.vm.cityNodes);
                    drawMapColor(cityDist, root, svg, shanxi, width);
                    var location = shanxi
                        .selectAll(".location")
                        .data(popu)
                        .enter()
                        .append("g")
                        .attr("class", "location")
                        .attr("transform", function (d) {
                            var lnla = [];
                            lnla.push(d.lng);
                            lnla.push(d.lat);
                            var coor = projection(lnla);
                            //console.log(coor);
                            return "translate(" + coor[0] + "," + coor[1] + ")";
                        });
                    location.append("circle")
                    .attr("r", 4);
                });
                // zoom in and out
                // add zoom in and zoom out
                var zoom = d3.behavior.zoom()
                    .translate([width / 2, height / 2])
                    .scale(root.size * 2.7)
                    .scaleExtent([root.size * 2.7, 8 * root.size])
                    .on("zoom", zoomed);
                shanxi.call(zoom)
                  .call(zoomed);
                function zoomed() {
                    projection
                    .translate(zoom.translate())
                    .scale(zoom.scale());
                    shanxi.selectAll("path")
                   .attr("d", path);
                }
            });//end json
    }//end drawMap

    //获取渐变函数最大值最小值
    function drawMapColor(cityDist,root,svg,shanxi,width) {
        console.log(cityDist);
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
        })
        .on("mouseover", function (d,i) {
            d3.select(this).attr("fill", "red");
            //console.log(d.properties.name);
            cityDist.filter(null).filter(d.properties.name)
            .redrawGroup();
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
            cityDist.filter(null).filter(null)
            .redrawGroup();
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
    }

    function drawcityDist(datas) {
        datas.forEach(function (d) {
            d.id = +d.id;
            d.values = d.values;
        });
        //console.log(datas);
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

        //draw sex dist
        $("#sexDist").html("");
        var sexDis = dc.pieChart("#sexDist"),
        sexDim = ndx.dimension(function (d) {
            return d.sex;
        }),
        sexDimGroup = sexDim.group().reduceSum(function (d) {
            return d.sexNum;
        });
        sexDis
            .width($("#sexDist").width() * 0.9)
            .height(200)
            .innerRadius(10)
            .dimension(sexDim)
            .group(sexDimGroup)
            .legend(dc.legend());
        sexDis.render();

        //drawAgeDist(ndx, datas);
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
        return cityDist;
    }
    // 点击某个市
    function clickCities(d, svg) {
        console.log(d);
        $("#map svg").html("");
        $scope.vm.cityNodes = [];
        $scope.vm.tableNodes = [];
        var id = d.properties.id,
        width = $("#map").width(),
        height = 600,
        mapPath = "mapdata/geometryCouties/" + id + "00.json",
        shanxi = svg.append("g")
        .attr("transform", "translate(0,0)");

        d3.json(mapPath, function (error, root) {
            //console.log(root);
            var zoomScale = getZoomScale(root.features, width, height),
            centers = getCenters(root.features),
            projection = d3.geo.mercator()
                .center(centers)
                .scale(zoomScale * 35)
                .translate([width / 2, height / 2]),
            path = d3.geo.path().projection(projection);
            shanxi
            .selectAll(".pathProvince")
            .data(root.features)
            .enter()
            .append("path")
            .attr("class", "pathProvince")
            .attr("stroke", "#000")
            .attr("stroke-width", 0.3)
            .attr("fill", "green")
            .attr("d", path)
            .on("click", function (d,i) {
                //$scope.vm.nowCityName = d.properties.name;
                setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.message = "Timeout called!";
                    });
                }, 100);
                //clickCities(d, svg);
            });
            // draw marker
                d3.json("data/popu.json", function (error, popu) {
                    console.log("popu", popu);
                     //获取中心点坐标
                    root.features.forEach(function (d, i) {
                        d.properties.values = 0;
                        var centroid = {};
                        centroid.id = d.properties.id;
                        centroid.name = d.properties.name;
                        //centroid.feature = d;
                        centroid.values = d.properties.values;
                        centroid.sex = "男";
                        centroid.sexNum = 0;
                        centroid.age = 0;
                        $scope.vm.cityNodes.push(centroid);
                    });

                    root.features.forEach(function (d, i) {
                        d.properties.values = 0;
                        var centroid = {};
                        centroid.id = d.properties.id;
                        centroid.name = d.properties.name;
                        //centroid.feature = d;
                        centroid.values = d.properties.values;
                        centroid.sex = "女";
                        centroid.sexNum = 0;
                        centroid.age = 0;
                        $scope.vm.cityNodes.push(centroid);
                    });
                    root.features.forEach(function (d, i) {
                        d.properties.values = 0;
                        var centroid = {};
                        centroid.id = d.properties.id;
                        centroid.name = d.properties.name;
                        centroid.values = d.properties.values;
                        $scope.vm.tableNodes.push(centroid);
                    });
                    var locationList = [];
                    popu.forEach(function (d,i) {
                        root.features.forEach(function (d1,i1) {
                            //console.log(d.properties.name, d3.geo.bounds(d1));
                            if (d.lng >= d3.geo.bounds(d1)[0][0] &&
                                d.lng <= d3.geo.bounds(d1)[1][0] &&
                                d.lat >= d3.geo.bounds(d1)[0][1] &&
                                d.lat <= d3.geo.bounds(d1)[1][1]) {
                                    //console.log(d1.properties.name);
                                    $scope.vm.cityNodes.forEach(function (d2, i2) {
                                        //console.log(d2);
                                        if (d2.id === d1.properties.id) {
                                            if (d.sex === d2.sex) {
                                                d2.sexNum += 1;
                                                d2.values = d2.values + 1;
                                            }
                                        }
                                    });
                                     //console.log(d1.properties.name);
                                    $scope.vm.tableNodes.forEach(function (d2, i2) {
                                        if (d2.id === d1.properties.id) {
                                            d2.values = d2.values + 1;
                                        }
                                    });
                                    d1.properties.values = d1.properties.values + 1;
                            }
                        });
                    });
                    console.log($scope.vm.cityNodes);
                    var cityDist = drawcityDist($scope.vm.cityNodes);
                    drawMapColor(cityDist,root,svg,shanxi,width);
                    // var location = shanxi
                    //     .selectAll(".location")
                    //     .data(popu)
                    //     .enter()
                    //     .append("g")
                    //     .attr("class", "location")
                    //     .attr("transform", function (d) {
                    //         var lnla = [];
                    //         lnla.push(d.lng);
                    //         lnla.push(d.lat);
                    //         var coor = projection(lnla);
                    //         //console.log(coor);
                    //         return "translate(" + coor[0] + "," + coor[1] + ")";
                    //     });
                    // location.append("circle")
                    // .attr("r", 4);
                });
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
