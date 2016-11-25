'use strict';
/*
*/

angular.module('app')
  .service('SPMedicationSharedDataService', function (Data) {
		var sharedData = {};

		  return {
		    addData: addData,
		    getData: getData
		  };

		  function addData(key, data) {
		    sharedData[key] = data;
		  }

		  function getData() {
		    return sharedData;
		  }
    });
