/**
 * Created by Wemakefocus on 2016/7/13.
 */
'use strict';

angular.module('app')
       .controller('SPDiagnosisCtrl',SPDiagnosisCtrl);

function SPDiagnosisCtrl($scope, $rootScope, Data, SPDiagnosisSharedDataService) {
    $scope.isMax = false;
    $scope.pIds = [
        945209345,
        390870343,
        792838150,
        843209388,
        200483967,
        379404302,
        391970840,
        936108059,
        918102054,
        268058664,
        885653512,
        786333707,
        189759502,
        539164696,
        280543278
    ];

    var startRender = function () {
        $scope.$broadcast('STARTRENDER', {});
        console.log("Broadcast Message.");
    }

    $scope.search = function (pId,str) {
        if(!!str && str === "toggleMax") $scope.isMax = !$scope.isMax;
        $rootScope.pItemSelected = pId;

        d3.select('#treemap svg').remove();
        $("#treemapLoading").css("margin-left",$(".widget-body").width()/2-30);
        d3.select('#chart_sankeys svg').remove();
        $("#chart_sankeysLoading").css("margin-left",$("#chart_sankeys").width()/2-30);
        
        $scope.isGraphLoading_dia = true;
        $rootScope.isSPDiagnosisGraphLoading = true;
        $scope.isGraphLoading = true;


        Data.getSankeyData(pId).then(function (res) {
              if(res.Return == 0){
                $("#chart_sankeys svg g").html("暂无数据！！！");
                $("#treemap").html("暂无数据");
                return;
              }

            $scope.dTypes = res.Data;
            var sankeyData = res.Data,
                dataL = sankeyData.length;
            if(!!str && str !== "toggleMax"){
                console.log(str);
                for(var i=0;i<dataL;i++){
                    if(sankeyData[i].CohortName === str){
                        sankeyData = sankeyData.slice(i,i+1);
                        $scope.typeSelection = $scope.dTypes[i];
                        break;
                    }
                }
            }
            if(!str){
                sankeyData = sankeyData.slice(0,1);
                $scope.typeSelection = $scope.dTypes[0];
            }
            
            var records = {};
            records.data = getRecords(sankeyData);
            var recordsCf = crossfilter(records.data);
            records.dim = {
                "gender":recordsCf.dimension(function (d) {
                    return d.gender;
                }),
                "age":recordsCf.dimension(function (d) {
                    return d.age;
                }),
                "namecn":recordsCf.dimension(function (d) {
                    return d.namecn;
                }),
                "PID":recordsCf.dimension(function (d) {
                    return d.PID;
                }),
                "hierarchy":recordsCf.dimension(function (d) {
                    return d.hierarchy;
                }),
                "ftype":recordsCf.dimension(function (d) {
                    // console.log(d);
                    return d.ftype;
                })
            };

            var namecnSumGroup = records.dim.namecn.group().reduce(
                function reduceAdd(p,v) {
                    if(typeof p !== "object") p={};
                    p['ftype'] = v.ftype;
                    p["hierarchy"] = v.hierarchy;
                    p["value"] = (p["value"]||0) + 1;
                    return p;
                },
                function reduceRemove(p,v) {
                },
                function reduceInitial() {
                    return 0;
                }
            )

            var treemapData = namecnSumGroup.all();
            var treemapRec = [],
                ftypeRec = [],
                hierarchyRec = [],
                hierarchyJson = {};
            for(var i=0;i<treemapData.length;i++){
                if(!!treemapData[i].value){
                    // console.log(treemapData[i]);
                    if(ftypeRec.indexOf(treemapData[i].value.ftype) === -1){
                        // console.log(treemapData[i].value.ftype);
                        if(!!treemapData[i].value.hierarchy)
                            hierarchyJson[treemapData[i].value.ftype] = {};
                        else
                            hierarchyJson[treemapData[i].value.ftype] = [];
                        ftypeRec.push(treemapData[i].value.ftype);
                    }
                    if(hierarchyRec.indexOf(treemapData[i].value.hierarchy) === -1){
                        if(!treemapData[i].value.hierarchy){
                            var ftypeA = hierarchyJson[treemapData[i].value.ftype];
                            if(ftypeA.indexOf(treemapData[i].key) === -1 ){
                                ftypeA.push(treemapData[i].key);
                            }
                            continue;
                        }
                        hierarchyJson[treemapData[i].value.ftype][treemapData[i].value.hierarchy] = [];
                        hierarchyRec.push(treemapData[i].value.hierarchy);
                    }
                    var ftypeA = hierarchyJson[treemapData[i].value.ftype][treemapData[i].value.hierarchy];
                    if(ftypeA.indexOf(treemapData[i].key) === -1 ){
                        ftypeA.push(treemapData[i].key);
                    }
                    if(treemapData[i].value.ftype === "DIAGNOSIS"){
                        var rec = {
                            'value':treemapData[i].value.value
                        };
                        if(!treemapData[i].value.hierarchy){
                            rec.region = treemapData[i].value.ftype;
                            rec.subregion = treemapData[i].value.ftype;
                            rec.key =treemapData[i].key;
                        }else {
                            // rec.region = treemapData[i].value.ftype;
                            rec.subregion = treemapData[i].value.hierarchy;
                            rec.key = treemapData[i].key;
                        }
                    }

                    // console.log(rec);
                    treemapRec.push(rec);
                }
            }


            /////////////////////////////////Data prepared for Sankey//////////////////////////////////
               var name_cn ={
                "ChronicObstructivePulmonaryDis":"慢性阻塞性肺病",
                "Heart_failure":"心力衰竭",
                "Obesity":"肥胖症",
                "PulmonaryDis":"肺病",
                "KidneyDis":"肾病",
                "Diabetes":"糖尿病"
               };
              var cohortslist = {model:"1",lists:[]};  

              for(var i = 0 ;i<sankeyData.length; i++){
                  var patilist = {};
                  patilist["id"] = sankeyData[i].CohortIdx;
                  patilist["name"] = name_cn[sankeyData[i].CohortName];
                  cohortslist.lists.push(patilist);
                  var similarities = sankeyData[i].Similarities;
                  for(var j= 0; j < similarities.length ; j++){
                      var sequ = similarities[j].Sequences;
                      similarities[j].Sequences = d3.nest()
                          .key(function(d) { return d["DD"]; })
                          .sortKeys(d3.ascending)
                          .entries(sequ);
                  }
              }
              /////////////////////////////////////////////////////////////////////////////////////////

            $scope.$broadcast('getHierarchyJson',hierarchyJson);
            $rootScope.isSPDiagnosisGraphLoading = false;
            $scope.isGraphLoading = false;
            // $("treemapLoading").removeClass(".loading-spinner");
            // console.log(treemapRec);
            
            SPDiagnosisSharedDataService.addData("records", records);
            SPDiagnosisSharedDataService.addData("treemapRec", treemapRec);
            SPDiagnosisSharedDataService.addData("hierarchyJson", hierarchyJson);
            SPDiagnosisSharedDataService.addData("sankeyData", sankeyData);
            SPDiagnosisSharedDataService.addData("cohortslist", cohortslist);
            
            startRender();
        })
    }

 /////////////////////////////// data prepared for treemap //////////////////////////////

    function getRecords(data) {
         // console.log(data);
        // console.log("getRecords");
        var records = [],
            thisYear = new Date().getFullYear();
        for(var i=0;i<data.length;i++){
            var patients = data[i].Similarities;
            for(var j=0;j<patients.length;j++){
                var age = thisYear - patients[j].YOB + 1,
                    gender = patients[j].Gender,
                    patientID = patients[j].PID,
                    sequences = patients[j].Sequences;
                for(var k=0;k<sequences.length;k++){
                    var record ={
                        'PID':patientID,
                        'age':age,
                        'gender':gender,
                        'namecn':sequences[k].NAMECN,
                        'hierarchy':sequences[k].HIERARCHY,
                        'ftype':sequences[k].FTYPE
                    };
                    // console.log(record);
                    records.push(record);
                }

            }
        }
        // console.log(records);
        return records;
    }
    if(!!$rootScope.pItemSelected) $scope.search($rootScope.pItemSelected);
    // console.log($scope.dTypeSelected);
    $rootScope.pageLoading = false;

}