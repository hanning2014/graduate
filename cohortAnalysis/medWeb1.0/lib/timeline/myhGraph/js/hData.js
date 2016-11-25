/*
File: HGraphMain.js

Description:
    Combines metrics and user data files in a hGraph friendly format

Authors:
    Michael Bester <michael@kimili.com>
    Ivan DiLernia <ivan@goinvo.com>
    Danny Hadley <danny@goinvo.com>
    Matt Madonna <matthew@myimedia.com>

License:
    Copyright 2012, Involution Studios <http://goinvo.com>

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

// multiuser example namespace
var mu = mu  || {};

mu.data = function(){
	var metrics;		// metrics object (see metrics.json for format)

	/**
	* Given user data. 
	*
	*/
	var process = function(user) {

		var userMetric = findMetric(user.gender);
		var userDatapoints = user["score_data"];
		var dataPoints = [];
		
		// retrieves the appropriate metric sets based on gender
		function findMetric(gender){
			
			for(var i=0; i < metrics.length ; i++) {
				if (metrics[i].gender === gender){
					return metrics[i].metrics;
				}
			}
			return null;
		}

		// finds a datapoint correspondent to a given metric in user dataset 
		function findDatapoint(metric){
			console.log(metric);
			for(var i=0; i<userDatapoints.length; i++) {
				if(userDatapoints[i][metric] !== undefined ) {
					console.log(userDatapoints[i]);
					return userDatapoints[i];
				}
			}
			console.log("not found Datapoint");
			return null;
		}
		
		//Determines score for an atomic (no children) metric
		function scoreAtomic(metric){
			console.log(metric);
			var currentDatapoint = findDatapoint(metric.name);
			console.log(currentDatapoint);
			return {
				label: metric.name,
				score: HGraph.prototype.calculateScoreFromValue(metric.features, currentDatapoint.value), 
				value: parseFloat(currentDatapoint.value).toFixed(2) +  ' ' +  metric.features.unitlabel,
				weight: metric.features.weight
			};
		};

		// get scores for all metrics
		for(var i=0; i<userMetric.length; i++){
			console.log(userMetric);
			dataPoints.push(scoreAtomic(userMetric[i]));
		}
		return dataPoints;
	},

	/*
	*	initalize data converter
	*/
	initialize = function(metric) {
		metrics = metric;
	};

return{
	initialize : initialize,
	process : process
}

}();