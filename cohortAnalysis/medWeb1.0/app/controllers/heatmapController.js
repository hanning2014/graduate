"use strict";
angular.module('app')
  .controller('heatmapController', function ($scope,Data,$rootScope) {
    $rootScope.pageLoading = false;
    console.log("heatmapController", "start");
    $("#map").height(800);
    drawgoogleMap();
    function drawgoogleMap() {
        var map = new BMap.Map("map");          // 创建地图实例
	    var point = new BMap.Point(109.5996,35.7396);
	    map.centerAndZoom(point, 8);             // 初始化地图，设置中心点坐标和地图级别
	    map.enableScrollWheelZoom(); // 允许滚轮缩放
		var stylejson = [
          {
                    "featureType": "boundary",
                    "elementType": "geometry.stroke",
                    "stylers": {}
          },
          {
                    "featureType": "road",
                    "elementType": "all",
                    "stylers": {}
          }
];
	    map.setMapStyle({styleJson: stylejson});
	    var points = [];
	    Data.getSankeyData('data/popu50000.json').then(function (res) {
            console.log(res);
            res.forEach(function (d) {
                var pp = {
                    "lng": d.lng,
                    "lat": d.lat,
                    "count": 1
                };
                if (points.indexOf(d) >= 0) {
                    points[points.indexOf(d)].count += 1;
                }else {
                    points.push(pp);
                }
            });
            console.log(res);
            var heatmapOverlay = new BMapLib.HeatmapOverlay({"radius":20});
			map.addOverlay(heatmapOverlay);
			heatmapOverlay.setDataSet({ data: points, max:100});
		    function setGradient() {
		     	/*格式如下所示:
				{
			  		0:'rgb(102, 255, 0)',
			 	 	.5:'rgb(255, 170, 0)',
				  	1:'rgb(255, 0, 0)'
				}*/
		     	var gradient = {};
		     	var colors = document.querySelectorAll("input[type='color']");
		     	colors = [].slice.call(colors,0);
		     	colors.forEach(function(ele){
					gradient[ele.getAttribute("data-key")] = ele.value; 
		     	});
		        heatmapOverlay.setOptions({"gradient":gradient});
		    }
	    });
	    }
});
