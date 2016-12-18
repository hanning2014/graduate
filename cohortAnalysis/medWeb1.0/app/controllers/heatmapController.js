"use strict";
angular.module('app')
  .controller('heatmapController', function ($scope,Data,$rootScope) {
  	$rootScope.pageLoading = false; 
    console.log("heatmapController", "start" );
    $("#map").height(800);
	// minimal heatmap instance configuration
	var heatmapInstance = h337.create({
	  // only container is required, the rest will be defaults
	  container: document.querySelector('#map')
	});
	 
	// now generate some random data
	var points = [];
	var max = 0;
	var width = 840;
	var height = 800;
	var len = 200;
	 
	while (len--) {
	  var val = Math.floor(Math.random()*100);
	  max = Math.max(max, val);
	  var point = {
	    x: Math.floor(Math.random()*width),
	    y: Math.floor(Math.random()*height),
	    value: val
	  };
	  points.push(point);
	}
	// heatmap data format
	var data = {
	  max: max,
	  data: points
	};
	// if you have a set of datapoints always use setData instead of addData
	// for data initialization
	heatmapInstance.setData(data);
});
