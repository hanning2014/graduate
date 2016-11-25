"use strict";
angular.module('app')
  .controller('sankeyController', function ($scope,Data, SPDiagnosisSharedDataService, $interval,$location,$rootScope){
    console.log("sankeyController start!!!");
    $rootScope.pageLoading = false;
});